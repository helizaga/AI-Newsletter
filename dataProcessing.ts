import { queryBingSearchAPI } from "./apiClients";
import { scrapeWebContent, cleanText } from "./utils";

interface SearchData {
  url: string;
  text: string;
}

// This function processes the data for a given searchTerm.
// It fetches search results, scrapes web content, and processes the text using TextRank.
async function dataProcessingPipeline(
  searchTerm: string
): Promise<SearchData[]> {
  const searchResults = await queryBingSearchAPI(searchTerm);
  console.log("Search results: ", searchResults);
  const urls: string[] = searchResults.map((result) => result.url);

  const contentPromises: Promise<string>[] = urls.map((url) =>
    scrapeWebContent(url)
  );
  const rawTexts: string[] = await Promise.all(contentPromises);

  const processedData: SearchData[] = rawTexts.map((rawText, index) => {
    const cleanedText: string = cleanText(rawText);

    return {
      url: urls[index], // Add the corresponding URL here.
      text: cleanedText,
    };
  });

  return processedData;
}

export { dataProcessingPipeline };
