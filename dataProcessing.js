import { queryBingSearchAPI } from "./apiClients.js";
import { scrapeWebContent } from "./utils.js";
import { TextRank } from "./TextRank.js";
import { cleanText } from "./utils.js";

// This function processes the data for a given searchTerm.
// It fetches search results, scrapes web content, and processes the text using TextRank.
async function dataProcessingPipeline(searchTerm) {
  const searchResults = await queryBingSearchAPI(searchTerm);
  const urls = searchResults.map((result) => result.url);

  const contentPromises = urls.map((url) => scrapeWebContent(url));
  const rawTexts = await Promise.all(contentPromises);

  const textRank = new TextRank();

  // This function processes the rawText using TextRank and cleans the summarized text.
  const processedData = rawTexts.map((rawText) => {
    const summarizedText = textRank.summarizeText(rawText, "medium");
    return cleanText(summarizedText);
  });

  return processedData;
}

export { dataProcessingPipeline };
