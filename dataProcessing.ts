import { queryBingSearchAPI } from "./apiClients";
import { scrapeWebContent, cleanText } from "./utils";
import { PrismaClient } from "@prisma/client";

// This function processes the data for a given searchTerm.
// It fetches search results, scrapes web content, and processes the text using TextRank.

const prisma = new PrismaClient();

interface SearchData {
  url: string;
  text: string;
}

async function isArticleUsed(url: string, userId: number): Promise<boolean> {
  const usedArticle = await prisma.usedArticle.findFirst({
    where: {
      url: url,
      newsletter: {
        userId: userId,
      },
    },
  });

  return usedArticle !== null;
}

// This function processes the data from a given search term by querying the Bing Search API,
// scraping the web content, and cleaning the text. It returns an array of processed data objects.
async function dataProcessingPipeline(
  searchTerm: string,
  userId: number // Add userId as a parameter
): Promise<SearchData[]> {
  try {
    const searchResults = await queryBingSearchAPI(searchTerm);
    const urls: string[] = searchResults.map((result) => result.url);

    // Filter out the used URLs
    const newUrls: string[] = [];
    for (const url of urls) {
      const isUsed = await isArticleUsed(url, userId);
      if (!isUsed) {
        newUrls.push(url);
      }
    }

    const contentPromises: Promise<string>[] = newUrls.map(
      // This function maps a URL to the scraped web content.
      (url) => scrapeWebContent(url)
    );
    const rawTexts: string[] = await Promise.all(contentPromises);

    const processedData: SearchData[] = rawTexts.map(
      // This function processes raw text and returns an object containing the cleaned text and its corresponding URL.
      (rawText, index) => {
        const cleanedText: string = cleanText(rawText);

        return {
          url: newUrls[index],
          text: cleanedText,
        };
      }
    );

    return processedData;
  } catch (error) {
    console.error("Error in data processing pipeline:", error);
    throw error;
  }
}

export { dataProcessingPipeline };
