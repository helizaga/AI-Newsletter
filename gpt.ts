import { generateChatCompletion } from "./apiClients";

interface Message {
  role: "system" | "user";
  content: string;
}

// This function generates the best Bing search query for a given topic and reason using GPT.
async function generateOptimalBingSearchQuery(
  topic: string,
  reason: string
): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are an AI tasked with generating the best Bing search query for a given topic and reason. Provide the search query without any intro or closer.
      Don't wrap the search query in quotes.`,
    },
    {
      role: "user",
      content: `What's the best Bing search query to research ${topic} for the purpose of ${reason}?`,
    },
  ];

  const searchQuery: string = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo",
    0.7,
    200
  );

  return searchQuery;
}
// This function truncates the given text to a specified maximum length.
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

// This function generates a summary of the given processed data (articles) using GPT.
// It truncates each article to 14700 characters and then generates a summary of 100-200 words..
async function generateSummaryWithGPT(
  processedData: string[]
): Promise<string> {
  const summaries: string[] = [];

  for (const article of processedData) {
    const truncatedArticle = truncateText(article, 14700); // Truncate the article to 5000 characters
    const messages: Message[] = [
      {
        role: "system",
        content: `You are an AI tasked with summarizing the content of an article. Generate a summary of 100-200 words.`,
      },
      {
        role: "user",
        content: `Summarize the following article: ${truncatedArticle}`,
      },
    ];

    const summary: string = await generateChatCompletion(
      messages,
      "gpt-3.5-turbo",
      0.7,
      500
    );

    summaries.push(summary);
  }

  return summaries.join("\n\n");
}

// This function generates a customized newsletter using GPT, based on the given
// search term, reason, summarized text, and URLs. The newsletter is in the style
// of a Medium post and includes several sections, each teaching the reader something new.
async function generateNewsletterWithGPT(
  searchTerm: string,
  reason: string,
  summarizedText: string,
  urls: string[]
): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are an AI tasked with creating a customized newsletter for a user. The newsletter should be written in a style similar to a Medium post and should be informative and engaging. Your task includes the following:
      - The newsletter should have several sections, each teaching the reader something new.
      - Each section should transition seamlessly into the next.
      - Embed URLs into the newsletter where appropriate.
      - Ensure the content is comprehensive and engaging for the reader.
      - Maintain a conversational yet informative tone throughout.`,
    },
    {
      role: "user",
      content: `Write a newsletter about ${searchTerm} using the following summarized text and URLs:
      - Summarized text: ${summarizedText}
      - URLs: ${JSON.stringify(urls)}
      - I want this newsletter because ${reason}.`,
    },
  ];

  const newsletterContent: string = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo",
    0.5, // Adjust this value based on the quality of the generated content
    3000
  );

  return newsletterContent;
}

export {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
};
