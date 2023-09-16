// dataProcessing.ts
import { queryBingSearchAPI } from "./apiClients";
import { scrapeWebContent, cleanText } from "./utils";
import { prisma } from "./prismaClient";
import { getRelevanceScore } from "./gpt";

interface ArticleData {
  url: string;
  text: string;
}

async function isArticleUsed(url: string, userId: number): Promise<boolean> {
  // checking if article was used by same user/admin before
  const usedArticle = await prisma.usedArticle.findFirst({
    where: {
      url: url,
      newsletter: {
        userId: userId,
      },
    },
  });

  return Boolean(usedArticle);
}

async function processArticles(
  optimalSearchQuery: string,
  userId: number
): Promise<ArticleData[]> {
  const searchResults = await queryBingSearchAPI(optimalSearchQuery);
  const urls: string[] = searchResults.map((result) => result.url);

  const urlPromises: Promise<boolean>[] = urls.map((url) =>
    isArticleUsed(url, userId)
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
  searchTerm: string,
  reason: string
): Promise<ArticleData[]> {
  const relevanceScores = await Promise.all(
    articles.map((data) => getRelevanceScore(data.text, searchTerm, reason))
  );

  return articles
    .map((data, index) => ({ ...data, relevanceScore: relevanceScores[index] }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

async function processAndSortArticles(
  searchTerm: string,
  reason: string,
  optimalSearchQuery: string,
  userId: number
): Promise<ArticleData[]> {
  // const processedArticles = await processArticles(optimalSearchQuery, userId);
  // return sortArticles(processedArticles, searchTerm, reason);
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

export { processAndSortArticles };
