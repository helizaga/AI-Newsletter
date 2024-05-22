import { MessageContent } from "@langchain/core/messages";
import { Tiktoken } from "tiktoken/lite";
import { load } from "tiktoken/load";
import registry from "tiktoken/registry.json";
import models from "tiktoken/model_to_encoding.json";
const GPT_API_KEY = process.env.GPT_API_KEY as string;
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

let totalCost = 0;

const openai = new ChatOpenAI({
  apiKey: GPT_API_KEY,
  temperature: 0.7,
});

export async function generateChatCompletion(
  messages: (SystemMessage | HumanMessage)[],
  model: string,
  temperature: number = 0.7,
  maxTokens: number | null = null
): Promise<string> {
  openai.temperature = temperature;
  openai.model = model;
  openai.maxTokens = maxTokens ?? undefined;
  try {
    const response = await openai.invoke(messages);
    const content = response.content;
    // Set the cost per 1000 tokens for each model
    const costPerThousandTokensInput = 0.5 / 1000; // $0.0005 per token
    const costPerThousandTokensOutput = 1.5 / 1000; // $0.0015 per token

    // Count tokens for the input messages as well
    for (const message of messages) {
      //convert to string from MessageContent
      await countTokens(
        message.content as string,
        model,
        costPerThousandTokensInput
      );
    }
    // Count tokens for the output
    await countTokens(content as string, model, costPerThousandTokensOutput);
    return content as string;
  } catch (error: any) {
    console.error(error.response || error); // Log the full error response
    throw new Error(
      `Error ${error.response.status}: ${error.response.statusText}`
    );
  }
  // console.log("model:", model);
  // await countTokens("Hello", model, 0.03);
  // return "" + totalCost;
  //return "This is a dummy completion.";
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
  const messages = [
    new SystemMessage(
      `You are an AI tasked with generating the best Bing search query for a given topic and reason. Provide the search query without any intro or closer. Don't wrap the search query in quotes.`
    ),
    new HumanMessage(
      `What's the best Bing search query to research ${topic} for the purpose of ${reason}?`
    ),
  ];

  const searchQuery: MessageContent = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo-0125",
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
    const messages = [
      new SystemMessage(
        `You are an AI tasked with summarizing the content of an article. Generate a summary of 200-300 words.`
      ),
      new HumanMessage(`Summarize the following article: ${article}`),
    ];

    const summary: MessageContent = await generateChatCompletion(
      messages,
      "gpt-3.5-turbo-0125",
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
  topic: string,
  reason: string,
  summarizedText: string,
  urls: string[]
): Promise<string> {
  const messages = [
    new SystemMessage(`You are an AI tasked with creating a customized newsletter for a user without mentioning specific businesses, brands, or commercial services. The newsletter should be written in a style similar to a Medium post and should be informative and engaging. Your task includes the following:
    - The newsletter should have several sections, each teaching the reader something new.
    - Each section should transition seamlessly into the next.
    - Embed URLs into the newsletter where appropriate.
    - Ensure the content is comprehensive and engaging for the reader.
    - Maintain a conversational yet informative tone throughout.
    - Use Markdown formatting and emojis.
    - Reference the articles you used to generate the newsletter as outside sources.`),
    new HumanMessage(`Write a newsletter about ${topic} using the following summarized text and URLs:
    - Summarized text: ${summarizedText}
    - URLs: ${JSON.stringify(urls)}
    - I want this newsletter because ${reason}.`),
  ];

  const newsletterContent: string = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo-0125",
    0.5, // Adjust this value based on the quality of the generated content
    4000
  );
  console.log("total cost: ", totalCost);
  totalCost = 0;

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
  const messages = [
    new SystemMessage(
      `You are an AI tasked with determining the relevance of an article to a given topic and reason. Provide a relevance score between 0 and 1, where 1 is highly relevant and 0 is not relevant at all. Please respond with a number only.`
    ),
    new HumanMessage(
      `Rate the relevance of this article to the topic "${topic}" and the reason "${reason}": ${article}`
    ),
  ];

  const score: string = await generateChatCompletion(
    messages,
    "gpt-3.5-turbo-0125",
    0.7,
    50
  );

  return parseFloat(score);
}

export {
  generateSummaryWithGPT,
  generateNewsletterWithGPT,
  generateOptimalBingSearchQuery,
  getRelevanceScore,
};
