"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalizedContent = void 0;
const dataProcessing_1 = require("./dataProcessing");
const gpt_1 = require("./gpt");
// This function generates personalized content for a given searchTerm.
// It calls the dataProcessingPipeline to process the data and then generates content using GPT.
async function generatePersonalizedContent(searchTerm, reason) {
    const processedData = await (0, dataProcessing_1.dataProcessingPipeline)(searchTerm);
    const content = await (0, gpt_1.generateContentWithGPT)(searchTerm, reason, processedData.map((data) => data.text));
    return content;
}
exports.generatePersonalizedContent = generatePersonalizedContent;
async function displayContent() {
    const content = await generatePersonalizedContent("upcoming sneaker releases", "be able to buy the shoes at the retail price");
    console.log(content);
}
displayContent();
