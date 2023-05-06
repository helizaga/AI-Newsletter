import { dataProcessingPipeline } from "./dataProcessing.js";
import { generateContentWithGPT4 } from "./gpt4.js";

// This function generates personalized content for a given searchTerm.
// It calls the dataProcessingPipeline to process the data and then generates content using GPT-4.
async function generatePersonalizedContent(searchTerm) {
  const processedData = await dataProcessingPipeline(searchTerm);
  const content = await generateContentWithGPT4(searchTerm, processedData);
  return content;
}

async function displayContent() {
  const content = await generatePersonalizedContent("artificial intelligence");
  console.log(content);
}

displayContent();

export { generatePersonalizedContent };
