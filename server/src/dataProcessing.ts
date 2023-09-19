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
      newsletter: {
        userId: userId,
        topic: topic,
        reason: reason,
      },
    },
  });

  return Boolean(usedArticle);
}

async function processArticles(
  optimalSearchQuery: string,
  userId: string,
  topic: string,
  reason: string
): Promise<ArticleData[]> {
  const searchResults = await queryBingSearchAPI(optimalSearchQuery);
  let urls: string[] = searchResults.map((result) => result.url);

  const urlPromises: Promise<boolean>[] = urls.map((url) =>
    isArticleUsed(url, userId, topic, reason)
  );
  const isUsedArray: boolean[] = await Promise.all(urlPromises);

  const newUrls: string[] = urls.filter((url, index) => !isUsedArray[index]);

  const contentPromises: Promise<string>[] = newUrls.map((url) =>
    scrapeWebContent(url)
  );
  const rawTexts: string[] = await Promise.all(contentPromises);

  return rawTexts.map((rawText, index) => {
    const cleanedText: string = cleanText(rawText);
    return {
      url: newUrls[index],
      text: cleanedText,
    };
  });
}

async function sortArticles(
  articles: ArticleData[],
  topic: string,
  reason: string
): Promise<ArticleData[]> {
  const relevanceScores = await Promise.all(
    articles.map((data) => getRelevanceScore(data.text, topic, reason))
  );

  return articles
    .map((data, index) => ({ ...data, relevanceScore: relevanceScores[index] }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

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
  ];
}

// This function generates personalized content based on a given search term and reason.
// It first generates an optimal Bing search query using GPT, then processes the data
// from the search results, and finally creates a newsletter using the summarized text
// and relevant URLs.
async function generatePersonalizedContent(
  topic: string,
  reason: string,
  userId: string
): Promise<{
  content: string;
  optimalSearchQuery: string;
  firstFourArticles: ArticleData[];
}> {
  // Generate the optimal Bing search query using GPT
  const optimalSearchQuery: string = await generateOptimalBingSearchQuery(
    topic,
    reason
  );

  console.log("Optimal search query: ", optimalSearchQuery);

  const sortedArticles = await processAndSortArticles(
    topic,
    reason,
    optimalSearchQuery,
    userId
  );

  // Take only the first 4 most relevant articles
  const firstFourArticles = sortedArticles.slice(0, 4);

  if (firstFourArticles.length === 0) {
    throw new Error(
      "No relevant articles found for the given search term and reason."
    );
  } else if (firstFourArticles.length < 4) {
    console.warn(
      "Fewer than 4 relevant articles found. The newsletter may be shorter than expected."
    );
  }

  console.log("First four articles: ", firstFourArticles);

  // Generate a summarized text using GPT
  const summarizedText: string = await generateSummaryWithGPT(
    firstFourArticles.map((data) => data.text)
  );

  console.log("Summarized text: ", summarizedText);

  const unsubscribeLink = `http://yourdomain.com/unsubscribe?userId=${userId}&email=recipient@email.com`;

  // Create a newsletter using the summarized text
  const content: string =
    (await generateNewsletterWithGPT(
      topic,
      reason,
      summarizedText,
      firstFourArticles.map((data) => data.url)
    )) + `\n\n[Unsubscribe](${unsubscribeLink})`;

  return {
    content: content,
    optimalSearchQuery: optimalSearchQuery,
    firstFourArticles: firstFourArticles,
  };
}

export { isArticleUsed, processAndSortArticles, generatePersonalizedContent };
