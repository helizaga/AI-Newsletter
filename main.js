import { dataProcessingPipeline } from "./dataProcessing.js";
import { generateContentWithGPT4 } from "./gpt4.js";

// This function generates personalized content for a given searchTerm.
// It calls the dataProcessingPipeline to process the data and then generates content using GPT-4.
async function generatePersonalizedContent(searchTerm, reason) {
  const processedData = await dataProcessingPipeline(searchTerm);
  console.log(processedData);
  const content = await generateContentWithGPT4(
    searchTerm,
    reason,
    processedData
  );
  return content;
}

async function displayContent() {
  const content = await generatePersonalizedContent(
    "upcoming sneaker releases",
    "be able to buy the shoes at the retail price"
  );
  console.log(content);
}

displayContent();

export { generatePersonalizedContent };
