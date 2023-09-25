import { queryBingSearchAPI } from "../../services/bing/bing";
import { scrapeWebContent, cleanText } from "../utils/utils";
import { getRelevanceScore } from "../../services/gpt/gpt";
import {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
} from "../../services/gpt/gpt";

import { prisma } from "../db/prisma/prismaClient";

interface ArticleData {
  url: string;
  text: string;
}

// dataProcessing.ts
async function isArticleUsed(
  url: string,
  adminID: string,
  topic: string,
  reason: string
): Promise<boolean> {
  const usedArticle = await prisma.usedArticle.findFirst({
    where: {
      url: url,
      adminID: adminID, // new field
      topic: topic, // new field
      reason: reason, // new field
    },
  });
  return Boolean(usedArticle);
}

const processArticles = async (
  optimalSearchQuery: string,
  adminID: string,
  topic: string,
  reason: string
): Promise<ArticleData[]> => {
  const searchResults = await queryBingSearchAPI(optimalSearchQuery);
  const urls = searchResults.map((result) => result.url);

  const isUsedArray = await Promise.all(
    urls.map((url) => isArticleUsed(url, adminID, topic, reason))
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

const generateDummyURLs = (count: number): ArticleData[] => {
  const dummyArticles: ArticleData[] = [];
  for (let i = 1; i <= count; i++) {
    dummyArticles.push({
      url: `http://dummy${i}.com`,
      text: `Dummy article ${i}`,
    });
  }
  return dummyArticles;
};

async function processAndSortArticles(
  topic: string,
  reason: string,
  optimalSearchQuery: string,
  adminID: string
): Promise<ArticleData[]> {
  // const processedArticles = await processArticles(optimalSearchQuery, adminID);
  // return sortArticles(processedArticles, topic, reason);
  console.log("Dummy Processing and Sorting Articles");
  return generateDummyURLs(100);
}

async function getOrGenerateSummary(
  url: string,
  rawText: string
): Promise<string> {
  const existingSummary = await prisma.articleSummary.findUnique({
    where: { url },
  });
  if (existingSummary) {
    return existingSummary.id;
  }
  const newSummaryText = await generateSummaryWithGPT([cleanText(rawText)]);
  const newSummary = await prisma.articleSummary.create({
    data: { url, summary: newSummaryText },
  });
  return newSummary.id;
}

// This function generates personalized content based on a given search term and reason.
// It first generates an optimal Bing search query using GPT, then processes the data
// from the search results, and finally creates a newsletter using the summarized text
// and relevant URLs.
const generatePersonalizedContent = async (
  topic: string,
  reason: string,
  adminId: string,
  usedArticleSet: Set<string> // New parameter
): Promise<{
  content: string;
  optimalSearchQuery: string;
  firstFourArticles: ArticleData[];
}> => {
  const optimalSearchQuery = await generateOptimalBingSearchQuery(
    topic,
    reason
  );
  const sortedArticles = await processAndSortArticles(
    optimalSearchQuery,
    adminId,
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

  // More descriptive error handling
  if (firstFourArticles.length === 0) {
    if (sortedArticles.length === 0) {
      throw new Error(
        "No relevant articles found. The search query may need refinement."
      );
    } else {
      throw new Error(
        "All available articles for this query have already been used."
      );
    }
  }

  if (firstFourArticles.length < 4) {
    if (sortedArticles.length < 4) {
      console.warn(
        "Fewer articles were found in the search. You may need to expand your search query."
      );
    } else {
      console.warn(
        "Fewer than 4 new articles found. Some articles were already used."
      );
    }
  }

  const summarizedText = await generateSummaryWithGPT(
    firstFourArticles.map(({ text }) => text)
  );

  const content = await generateNewsletterWithGPT(
    topic,
    reason,
    summarizedText,
    firstFourArticles.map(({ url }) => url)
  );

  return { content, optimalSearchQuery, firstFourArticles };
};

export {
  isArticleUsed,
  processAndSortArticles,
  generatePersonalizedContent,
  getOrGenerateSummary,
};
