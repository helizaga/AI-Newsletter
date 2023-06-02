import { dataProcessingPipeline } from "./dataProcessing";
import { generateContentWithGPT } from "./gpt";

// Define the type of the processedData
interface ProcessedData {
  url: string;
  text: string;
}

// This function generates personalized content for a given searchTerm.
// It calls the dataProcessingPipeline to process the data and then generates content using GPT.
async function generatePersonalizedContent(
  searchTerm: string,
  reason: string
): Promise<string> {
  const processedData: ProcessedData[] = await dataProcessingPipeline(
    searchTerm
  );
  const content: string = await generateContentWithGPT(
    searchTerm,
    reason,
    processedData.map((data) => data.text)
  );
  return content;
}

async function displayContent(): Promise<void> {
  const content: string = await generatePersonalizedContent(
    "upcoming sneaker releases",
    "be able to buy the shoes at the retail price"
  );
  console.log(content);
}

displayContent();

export { generatePersonalizedContent };
