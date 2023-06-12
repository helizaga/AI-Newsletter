import { queryBingSearchAPI } from "./apiClients";
import { scrapeWebContent, cleanText } from "./utils";

// This function processes the data for a given searchTerm.
// It fetches search results, scrapes web content, and processes the text using TextRank.
interface SearchData {
  url: string;
  text: string;
}

async function dataProcessingPipeline(
  searchTerm: string
): Promise<SearchData[]> {
  try {
    const searchResults = await queryBingSearchAPI(searchTerm);
    const urls: string[] = searchResults.map((result) => result.url);

    const contentPromises: Promise<string>[] = urls.map((url) =>
      scrapeWebContent(url)
    );
    const rawTexts: string[] = await Promise.all(contentPromises);

    const processedData: SearchData[] = rawTexts.map((rawText, index) => {
      const cleanedText: string = cleanText(rawText);

      return {
        url: urls[index],
        text: cleanedText,
      };
    });

    return processedData;
  } catch (error) {
    console.error("Error in data processing pipeline:", error);
    throw error;
  }
}

export { dataProcessingPipeline };
