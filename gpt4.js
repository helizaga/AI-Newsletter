import { generateChatCompletion } from "./apiClients.js";

// This function generates content using GPT-4 based on the searchTerm and processedData.
// It creates a chat message structure and calls the generateChatCompletion function to get the response.
async function generateContentWithGPT4(searchTerm, processedData) {
  const dataSummary = processedData.join("\n\n");

  const messages = [
    {
      role: "system",
      content:
        "You will be asked to create a customized newsletter for a user. Create one with at least 6 articles options per answer.",
    },
    {
      role: "user",
      content: `Based on the following information about ${searchTerm}, create an academic newsletter with engagement metrics, links to articles, short summaries, and any other relevant sections:\n\n${dataSummary}`,
    },
  ];

  const responseText = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo",
    0.7,
    1000
  );
  return responseText;
}

export { generateContentWithGPT4 };
