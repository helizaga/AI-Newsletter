import axios from "axios";
import { Tiktoken } from "tiktoken/lite";
import { load } from "tiktoken/load";
import registry from "tiktoken/registry.json";
import models from "tiktoken/model_to_encoding.json";

const GPT_API_KEY = process.env.GPT_API_KEY as string;
const GPT_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

interface Message {
  role: string;
  content: string;
}

let totalCost = 0;

export async function generateChatCompletion(
  messages: Message[],
  model: string,
  temperature: number = 0.7,
  maxTokens: number | null = null
): Promise<string> {
  // Implement your function logic here.
  // const headers = {
  //   "Content-Type": "application/json",
  //   Authorization: `Bearer ${GPT_API_KEY}`,
  // };
  // const data: any = {
  //   model,
  //   messages,
  //   temperature,
  // };
  // if (maxTokens !== null) {
  //   data.max_tokens = maxTokens;
  // }
  // try {
  //   const response = await axios.post(GPT_API_ENDPOINT, data, { headers });
  //   const content = response.data.choices[0].message.content;
  //   // Set the cost per 1000 tokens for each model
  //   const costPerThousandTokensInput = model === "gpt-4" ? 0.03 : 0.003; // Set the cost per 1000 tokens for input
  //   const costPerThousandTokensOutput = model === "gpt-4" ? 0.06 : 0.004; // Set the cost per 1000 tokens for output
  //   // Count tokens for the input messages as well
  //   for (const message of messages) {
  //     await countTokens(message.content, model, costPerThousandTokensInput);
  //   }
  //   // Count tokens for the output
  //   await countTokens(content, model, costPerThousandTokensOutput);
  //   return content;
  // } catch (error: any) {
  //   console.error(error.response || error); // Log the full error response
  //   throw new Error(
  //     `Error ${error.response.status}: ${error.response.statusText}`
  //   );
  // }
  return "This is a dummy completion.";
}

async function countTokens(
  text: string,
  model: string,
  costPerThousandTokens: number
): Promise<void> {
  const modelData = await load(registry[models[model]]);
  const encoder = new Tiktoken(
    modelData.bpe_ranks,
    modelData.special_tokens,
    modelData.pat_str
  );
  const tokens = encoder.encode(text);
  totalCost += (tokens.length / 1000) * costPerThousandTokens;
  encoder.free();
}

export function getTotalCost(): number {
  return totalCost;
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
    "gpt-4",
    0.7,
    200
  );

  return searchQuery;
}
// This function generates a summary of the given processed data (articles) using GPT.
// It truncates each article to 14700 characters and then generates a summary of 100-200 words..
async function generateSummaryWithGPT(
  processedData: string[]
): Promise<string> {
  const summaries: string[] = [];

  for (const article of processedData) {
    const messages: Message[] = [
      {
        role: "system",
        content: `You are an AI tasked with summarizing the content of an article. Generate a summary of 200-300 words.`,
      },
      {
        role: "user",
        content: `Summarize the following article: ${article}`,
      },
    ];

    const summary: string = await generateChatCompletion(
      messages,
      "gpt-3.5-turbo-16k",
      0.7,
      700
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
      - Maintain a conversational yet informative tone throughout.
      - Use Markdown formatting and emojis.
      - Reference the articles you used to generate the newsletter as outside sources.`,
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
    "gpt-3.5-turbo-16k",
    0.5, // Adjust this value based on the quality of the generated content
    4000
  );

  return newsletterContent;
}

async function getRelevanceScore(
  article: string,
  topic: string,
  reason: string
): Promise<number> {
  if (article.trim() === "") {
    return 0;
  }
  const messages: Message[] = [
    {
      role: "system",
      content: `You are an AI tasked with determining the relevance of an article to a given topic and reason. Provide a relevance score between 0 and 1, where 1 is highly relevant and 0 is not relevant at all. Please respond with a number only.`,
    },
    {
      role: "user",
      content: `Rate the relevance of this article to the topic "${topic}" and the reason "${reason}": ${article}`,
    },
  ];

  const score: string = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo-16k",
    0.7,
    50
  );

  console.log("Relevance score: ", score);

  return parseFloat(score);
}

export {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
  getRelevanceScore,
};
