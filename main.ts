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

// This function generates personalized content based on a given search term and reason.
// It first generates an optimal Bing search query using GPT, then processes the data
// from the search results, and finally creates a newsletter using the summarized text
// and relevant URLs.
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

  // Generate a summarized text using GPT
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

// This function displays the generated content (newsletter) in the console.
async function displayContent(): Promise<void> {
  try {
    const content: string = await generatePersonalizedContent(
      "upcoming sneaker releases",
      "be able to buy the shoes at the retail price"
    );
    console.log("Newsletter content: ", content);
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

displayContent();

export { generatePersonalizedContent };
