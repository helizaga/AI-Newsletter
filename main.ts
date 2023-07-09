import { PrismaClient } from "@prisma/client";
import { dataProcessingPipeline } from "./dataProcessing";
import {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
  getRelevanceScore,
} from "./gpt";
import { getTotalCost } from "./apiClients";

// Define the type of the processedData
interface ProcessedData {
  url: string;
  text: string;
}

const prisma = new PrismaClient();

async function initializeApp() {
  const existingUser = await prisma.user.findUnique({
    where: {
      userEmail: "tom.elizaga@gmail.com",
    },
  });

  if (!existingUser) {
    const newUser = await prisma.user.create({
      data: {
        userEmail: "tom.elizaga@gmail.com",
        name: "Tom Elizaga",
        emailsToSendTo: ["tom.elizaga@gmail.com"],
      },
    });

    console.log("Created new user: ", newUser);
    return newUser;
  }

  return existingUser;
}

// This function generates personalized content based on a given search term and reason.
// It first generates an optimal Bing search query using GPT, then processes the data
// from the search results, and finally creates a newsletter using the summarized text
// and relevant URLs.
async function generatePersonalizedContent(
  searchTerm: string,
  reason: string,
  userId: number
): Promise<string> {
  // Generate the optimal Bing search query using GPT
  const optimalSearchQuery: string = await generateOptimalBingSearchQuery(
    searchTerm,
    reason
  );

  console.log("Optimal search query: ", optimalSearchQuery);
  // get user id from db
  const processedData: ProcessedData[] = await dataProcessingPipeline(
    optimalSearchQuery,
    userId
  );

  // Calculate relevance scores for each article
  const relevanceScoresPromises = processedData.map((data) =>
    getRelevanceScore(data.text, searchTerm, reason)
  );
  const relevanceScores = await Promise.all(relevanceScoresPromises);

  // Sort articles based on relevance scores
  const sortedArticles = processedData
    .map((data, index) => ({ ...data, relevanceScore: relevanceScores[index] }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Take only the first 4 most relevant articles
  const firstFourArticles = sortedArticles.slice(0, 4);

  if (firstFourArticles.length === 0) {
    throw new Error(
      "No relevant articles found for the given search term and reason."
    );
  } else if (firstFourArticles.length < 4) {
    console.warn(
      "Fewer than 4 relevant articles found. The newsletter may be shorter than expected."
    );
  }

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
async function displayContent(userId: number): Promise<void> {
  try {
    const content: string = await generatePersonalizedContent(
      "pool maintenance tips",
      "I want to learn how to maintain my pool.",
      userId
    );
    console.log("Newsletter content: ", content);

    // Log the total cost
    const totalCost = getTotalCost();
    console.log(`Total cost: $${totalCost}`);
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

initializeApp()
  .then((user) => {
    displayContent(user.id)
      .then(() => {})
      .catch((e) => {
        console.error("Error displaying content:", e);
      });
  })
  .catch((e) => {
    console.error("Error initializing app:", e);
  });
