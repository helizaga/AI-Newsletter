import { queryBingSearchAPI } from "./services/bing/bing";
import { scrapeWebContent, cleanText } from "../utils/utils";
import {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
  getRelevanceScore,
} from "./services/gpt/gpt";

import { ArticleData } from "./types/common";

import { prisma } from "../db/prisma/prismaClient";

export async function fetchUsedArticles(
  adminID: string,
  topic: string,
  reason: string
) {
  return await prisma.usedArticle.findMany({
    where: {
      adminID,
      topic,
      reason,
    },
  });
}

export async function addUsedArticles(
  firstFourArticles: ArticleData[],
  adminID: string,
  topic: string,
  reason: string,
  newsletterId: number
) {
  return Promise.all(
    firstFourArticles.map(async (article) => {
      const summaryID = await getOrGenerateSummary(article.url, article.text);
      return prisma.usedArticle.create({
        data: {
          url: article.url,
          newsletterId,
          adminID,
          topic,
          reason,
          summaryID,
          createdAt: new Date(),
        },
      });
    })
  );
}

const generateDummyURLs = (count: number): ArticleData[] => {
  const dummyArticles: ArticleData[] = [];
  for (let i = 1; i <= count; i++) {
    dummyArticles.push({
      url: `http://dummy${i}.com`,
      text: `Dummy article ${i}`,
      relevanceScore: 0,
    });
  }
  return dummyArticles;
};

const processArticles = async (
  optimalSearchQuery: string,
  adminID: string,
  topic: string,
  reason: string
): Promise<ArticleData[]> => {
  // const searchResults = await queryBingSearchAPI(optimalSearchQuery);
  // const urls = searchResults.map((result) => result.url);
  // const rawTexts = await Promise.all(urls.map(scrapeWebContent));
  // return rawTexts.map((rawText, index) => ({
  //   url: urls[index],
  //   text: cleanText(rawText),
  // }));
  return generateDummyURLs(100);
};

const generateDummySortedArticles = (count: number): ArticleData[] => {
  const dummySortedArticles: ArticleData[] = [];
  for (let i = 0; i < count; i++) {
    dummySortedArticles.push({
      url: `http://dummySorted${i}.com`,
      text: `Dummy Sorted Article ${i}`,
      relevanceScore: Math.random(),
    });
  }
  return dummySortedArticles.sort(
    (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
  );
};

const sortArticles = async (
  articles: ArticleData[],
  topic: string,
  reason: string,
  useDummyData = true // New parameter
): Promise<ArticleData[]> => {
  if (useDummyData) {
    return generateDummySortedArticles(100);
  }
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
  adminID: string
): Promise<ArticleData[]> {
  const processedArticles = await processArticles(
    optimalSearchQuery,
    adminID,
    topic,
    reason
  );
  return sortArticles(processedArticles, topic, reason);
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
  const allSortedArticles = await processAndSortArticles(
    optimalSearchQuery,
    adminId,
    topic,
    reason
  );
  // Filter out articles that have been used before
  const newArticles = allSortedArticles.filter(
    (article) => !usedArticleSet.has(article.url)
  );
  console.log("Sorted Articles:", allSortedArticles);
  console.log("Used Articles:", usedArticleSet);
  const firstFourArticles = newArticles.slice(0, 4);
  console.log("Chosen Articles:", firstFourArticles);

  // More descriptive error handling
  if (firstFourArticles.length === 0) {
    if (allSortedArticles.length === 0) {
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
    if (allSortedArticles.length < 4) {
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
  processAndSortArticles,
  generatePersonalizedContent,
  getOrGenerateSummary,
};
