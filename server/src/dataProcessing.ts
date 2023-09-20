import { queryBingSearchAPI } from "../../services/bing/bing";
import { scrapeWebContent, cleanText } from "../utils/utils";
import { prisma } from "../db/prisma/prismaClient";
import { getRelevanceScore } from "../../services/gpt/gpt";
import {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
} from "../../services/gpt/gpt";

interface ArticleData {
  url: string;
  text: string;
}

// dataProcessing.ts
async function isArticleUsed(
  url: string,
  userId: string,
  topic: string,
  reason: string
): Promise<boolean> {
  const usedArticle = await prisma.usedArticle.findFirst({
    where: {
      url: url,
      userId: userId, // new field
      topic: topic, // new field
      reason: reason, // new field
    },
  });
  return Boolean(usedArticle);
}

const processArticles = async (
  optimalSearchQuery: string,
  userId: string,
  topic: string,
  reason: string
): Promise<ArticleData[]> => {
  const searchResults = await queryBingSearchAPI(optimalSearchQuery);
  const urls = searchResults.map((result) => result.url);

  const isUsedArray = await Promise.all(
    urls.map((url) => isArticleUsed(url, userId, topic, reason))
  );

  const newUrls = urls.filter((_, index) => !isUsedArray[index]);
  const rawTexts = await Promise.all(newUrls.map(scrapeWebContent));

  return rawTexts.map((rawText, index) => ({
    url: newUrls[index],
    text: cleanText(rawText),
  }));
};

const sortArticles = async (
  articles: ArticleData[],
  topic: string,
  reason: string
): Promise<ArticleData[]> => {
  const relevanceScores = await Promise.all(
    articles.map(({ text }) => getRelevanceScore(text, topic, reason))
  );

  return articles
    .map((article, index) => ({
      ...article,
      relevanceScore: relevanceScores[index],
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

async function processAndSortArticles(
  topic: string,
  reason: string,
  optimalSearchQuery: string,
  userId: string
): Promise<ArticleData[]> {
  // const processedArticles = await processArticles(optimalSearchQuery, userId);
  // return sortArticles(processedArticles, topic, reason);
  console.log("Dummy Processing and Sorting Articles");
  return [
    {
      url: "http://dummy1.com",
      text: "Dummy article 1",
    },
    {
      url: "http://dummy2.com",
      text: "Dummy article 2",
    },
    {
      url: "http://dummy3.com",
      text: "Dummy article 3",
    },
    {
      url: "http://dummy4.com",
      text: "Dummy article 4",
    },
  ];
}

// This function generates personalized content based on a given search term and reason.
// It first generates an optimal Bing search query using GPT, then processes the data
// from the search results, and finally creates a newsletter using the summarized text
// and relevant URLs.
const generatePersonalizedContent = async (
  topic: string,
  reason: string,
  userId: string,
  usedArticleSet: Set<string> // New parameter
): Promise<{
  content: string;
  optimalSearchQuery: string;
  firstFourArticles: ArticleData[];
}> => {
  console.log("Used articles:", usedArticleSet);

  const optimalSearchQuery = await generateOptimalBingSearchQuery(
    topic,
    reason
  );
  const sortedArticles = await processAndSortArticles(
    optimalSearchQuery,
    userId,
    topic,
    reason
  );

  // Filter out articles that have been used before
  const newArticles = sortedArticles.filter(
    (article) => !usedArticleSet.has(article.url)
  );

  console.log("Sorted Articles:", sortedArticles);
  console.log("New Articles:", newArticles);

  const firstFourArticles = newArticles.slice(0, 4);
  console.log(firstFourArticles);

  if (firstFourArticles.length === 0) {
    throw new Error("No relevant articles found.");
  }

  if (firstFourArticles.length < 4) {
    console.warn("Fewer than 4 articles found.");
  }

  const summarizedText = await generateSummaryWithGPT(
    firstFourArticles.map(({ text }) => text)
  );
  const unsubscribeLink = `http://yourdomain.com/unsubscribe?userId=${userId}&email=recipient@email.com`;

  const content = `${await generateNewsletterWithGPT(
    topic,
    reason,
    summarizedText,
    firstFourArticles.map(({ url }) => url)
  )}\n\n[Unsubscribe](${unsubscribeLink})`;

  return { content, optimalSearchQuery, firstFourArticles };
};

export { isArticleUsed, processAndSortArticles, generatePersonalizedContent };
