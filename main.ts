import { dataProcessingPipeline } from "./dataProcessing";
import {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
} from "./gpt";

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
  // Generate the optimal Bing search query using GPT
  const optimalSearchQuery: string = await generateOptimalBingSearchQuery(
    searchTerm,
    reason
  );

  console.log("Optimal search query: ", optimalSearchQuery);

  const processedData: ProcessedData[] = await dataProcessingPipeline(
    optimalSearchQuery
  );

  // Take only the first 4 articles
  const firstFourArticles = processedData.slice(0, 4);

  console.log("First four articles: ", firstFourArticles);

  // Generate a summarized text using GPT-4
  const summarizedText: string = await generateSummaryWithGPT(
    firstFourArticles.map((data) => data.text)
  );

  console.log("Summarized text: ", summarizedText);

  // Create a newsletter using the summarized text
  const content: string = await generateNewsletterWithGPT(
    searchTerm,
    reason,
    summarizedText,
    firstFourArticles.map((data) => data.url)
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
