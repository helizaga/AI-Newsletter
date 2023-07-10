import { PrismaClient } from "@prisma/client";
import { processAndSortArticles } from "./dataProcessing";
import {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
} from "./gpt";
import { getTotalCost } from "./apiClients";

// Define the type of the processedData

const prisma = new PrismaClient();

async function initializeApp(userEmail: string, userName: string) {
  const existingUser = await prisma.user.findUnique({
    where: {
      userEmail: userEmail,
    },
  });

  if (!existingUser) {
    const newUser = await prisma.user.create({
      data: {
        userEmail: userEmail,
        name: userName,
        emailsToSendTo: [userEmail],
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

  const sortedArticles = await processAndSortArticles(
    searchTerm,
    reason,
    optimalSearchQuery,
    userId
  );

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

  // Create a new newsletter in the database
  const newsletter = await prisma.newsletter.create({
    data: {
      title: `Newsletter: ${optimalSearchQuery} - ${new Date().toISOString()}`,
      content: content,
      sentDate: new Date(),
      userId: userId,
      searchTerm: searchTerm,
      reason: reason,
    },
  });

  console.log("Created new newsletter: ", newsletter);

  // Update the UsedArticle table with the articles used in this newsletter
  await Promise.all(
    firstFourArticles.map((article) =>
      prisma.usedArticle.create({
        data: {
          url: article.url,
          newsletterId: newsletter.id,
          createdAt: new Date(),
        },
      })
    )
  );
  return content;
}

// This function displays the generated content (newsletter) in the console.
async function displayContent(
  userId: number,
  searchTerm: string,
  reason: string
): Promise<void> {
  try {
    const content: string = await generatePersonalizedContent(
      searchTerm,
      reason,
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

initializeApp("tom.elizaga@gmail.com", "Tom Elizaga")
  .then((user) => {
    if (!user) {
      throw new Error("No user returned from initializeApp");
    }
    if (!user.id) {
      throw new Error("User has no ID");
    }
    displayContent(
      user.id,
      "pool maintenance tips",
      "I want to learn how to maintain my pool."
    );
  })
  .catch((e) => {
    console.error("Error initializing app:", e);
  });
