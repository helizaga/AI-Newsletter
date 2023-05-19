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

  const processedData = rawTexts.map((rawText, index) => {
    //const summarizedText = textRank.summarizeText(rawText, "long");
    const cleanedText = cleanText(rawText);

    return {
      url: urls[index], // Add the corresponding URL here.
      text: cleanedText,
    };
  });

  return processedData;
}

export { dataProcessingPipeline };
