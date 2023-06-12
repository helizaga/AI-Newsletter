import { generateChatCompletion } from "./apiClients";

interface Message {
  role: "system" | "user";
  content: string;
}

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
    3000
  );

  return searchQuery;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

async function generateSummaryWithGPT(
  processedData: string[]
): Promise<string> {
  const summaries: string[] = [];

  for (const article of processedData) {
    const truncatedArticle = truncateText(article, 5000); // Truncate the article to 5000 characters
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
      3000
    );

    summaries.push(summary);
  }

  return summaries.join("\n\n");
}

async function generateNewsletterWithGPT(
  searchTerm: string,
  reason: string,
  summarizedText: string,
  urls: string[]
): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are an AI tasked with creating a customized newsletter for a user. The newsletter should be in the style of a Medium post. Your task includes the following:
      - The newsletter should have several sections, each teaching the reader something new.
      - Each section should transition seamlessly into the next.
      - Embed URLs into the newsletter where appropriate.
      - Ensure the content is comprehensive and engaging for the reader.`,
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
    0.7,
    3000
  );

  return newsletterContent;
}

export {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
};
