"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataProcessingPipeline = void 0;
const apiClients_1 = require("./apiClients");
const utils_1 = require("./utils");
const TextRank_1 = require("./TextRank");
// This function processes the data for a given searchTerm.
// It fetches search results, scrapes web content, and processes the text using TextRank.
async function dataProcessingPipeline(searchTerm) {
    const searchResults = await (0, apiClients_1.queryBingSearchAPI)(searchTerm);
    const urls = searchResults.map((result) => result.url);
    const contentPromises = urls.map((url) => (0, utils_1.scrapeWebContent)(url));
    const rawTexts = await Promise.all(contentPromises);
    const textRank = new TextRank_1.TextRank();
    const processedData = rawTexts.map((rawText, index) => {
        const summarizedText = textRank.summarizeText(rawText, "long");
        const cleanedText = (0, utils_1.cleanText)(summarizedText);
        return {
            url: urls[index],
            text: cleanedText,
        };
    });
    return processedData;
}
exports.dataProcessingPipeline = dataProcessingPipeline;
