import { queryBingSearchAPI } from "./apiClients";
import { scrapeWebContent, cleanText } from "./utils";
import { TextRank } from "./TextRank";

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
  const urls: string[] = searchResults.map((result) => result.url);

  const contentPromises: Promise<string>[] = urls.map((url) =>
    scrapeWebContent(url)
  );
  const rawTexts: string[] = await Promise.all(contentPromises);

  const textRank = new TextRank();

  const processedData: SearchData[] = rawTexts.map((rawText, index) => {
    const summarizedText: string = textRank.summarizeText(rawText, "long");
    const cleanedText: string = cleanText(summarizedText);

    return {
      url: urls[index], // Add the corresponding URL here.
      text: cleanedText,
    };
  });

  return processedData;
}

export { dataProcessingPipeline };
