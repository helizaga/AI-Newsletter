"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContentWithGPT = void 0;
const apiClients_1 = require("./apiClients");
// This function generates content using GPT based on the searchTerm and processedData.
// It creates a chat message structure and calls the generateChatCompletion function to get the response.
async function generateContentWithGPT(searchTerm, reason, processedData) {
    const dataSummary = processedData.join("\n\n");
    const messages = [
        {
            role: "system",
            content: "You will be asked to create a customized newsletter for a user. Write it in the style of a Medium post. Add other sections which intend to teach the reader something new. Make sure this section transitions seamlessly to the previous section. Make sure these sections are as comprehensive as the rest of the newsletter.",
        },
        {
            role: "user",
            content: `Write me a newsletter about ${searchTerm} using text below. I want this newsletter because ${reason}. Populate the newsletter with articles that are designed to get massive engagement. Each article should be summarized and include an analysis of why it's important for the reader to know. For each section, include a link to the cited articles, the urls are belows. Include a call to action and provide insight on your recommendations: 
       ${JSON.stringify(dataSummary)}`,
        },
    ];
    const responseText = await (0, apiClients_1.generateChatCompletion)(messages, "gpt-3.5-turbo", 0.7, 2048);
    return responseText;
}
exports.generateContentWithGPT = generateContentWithGPT;
