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

// Function to import an array of emails
async function importEmailList(
  userId: number,
  newEmailList: string[]
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user) {
    await prisma.user.update({
      where: { id: userId },
      data: { emailsToSendTo: newEmailList },
    });
    console.log("Email list imported successfully.");
  } else {
    console.log("User not found.");
  }
}

// Function to add a single email
async function addSingleEmail(userId: number, newEmail: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user && user.emailsToSendTo) {
    if (Array.isArray(user.emailsToSendTo)) {
      // Explicitly check if it's an array
      const updatedEmailsToSendTo = [...user.emailsToSendTo, newEmail];
      await prisma.user.update({
        where: { id: userId },
        data: { emailsToSendTo: updatedEmailsToSendTo },
      });
      console.log("New email added successfully.");
    } else {
      console.log("emailsToSendTo is not an array.");
    }
  } else {
    console.log("User not found or emailsToSendTo is null.");
  }
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

  const unsubscribeLink = `http://yourdomain.com/unsubscribe?userId=${userId}&email=recipient@email.com`;

  // Create a newsletter using the summarized text
  const content: string =
    (await generateNewsletterWithGPT(
      searchTerm,
      reason,
      summarizedText,
      firstFourArticles.map((data) => data.url)
    )) + `\n\n[Unsubscribe](${unsubscribeLink})`;

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
