import axios from "axios";
import { config } from "dotenv";
import { Tiktoken } from "tiktoken/lite";
import { load } from "tiktoken/load";
import registry from "tiktoken/registry.json";
import models from "tiktoken/model_to_encoding.json";

config(); // Load environment variables from .env file

const GPT_API_KEY = process.env.GPT_API_KEY as string;
const BING_API_KEY = process.env.BING_API_KEY as string;
const GPT_API_ENDPOINT: string = "https://api.openai.com/v1/chat/completions";

interface Message {
  role: string;
  content: string;
}

let totalCost = 0;

async function countTokens(
  text: string,
  model: string,
  costPerThousandTokens: number
) {
  const modelData = await load(registry[models[model]]);
  const encoder = new Tiktoken(
    modelData.bpe_ranks,
    modelData.special_tokens,
    modelData.pat_str
  );
  const tokens = encoder.encode(text);
  totalCost += (tokens.length / 1000) * costPerThousandTokens; // Adjust the cost calculation
  encoder.free();
}

export async function generateChatCompletion(
  messages: Message[],
  model: string,
  temperature: number = 0.7,
  maxTokens: number | null = null
): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GPT_API_KEY}`,
  };

  const data: any = {
    model,
    messages,
    temperature,
  };

  if (maxTokens !== null) {
    data.max_tokens = maxTokens;
  }

  try {
    const response = await axios.post(GPT_API_ENDPOINT, data, { headers });
    const content = response.data.choices[0].message.content;

    // Set the cost per 1000 tokens for each model
    const costPerThousandTokensInput = model === "gpt-4" ? 0.03 : 0.003; // Set the cost per 1000 tokens for input
    const costPerThousandTokensOutput = model === "gpt-4" ? 0.06 : 0.004; // Set the cost per 1000 tokens for output

    // Count tokens for the input messages as well
    for (const message of messages) {
      await countTokens(message.content, model, costPerThousandTokensInput);
    }

    // Count tokens for the output
    await countTokens(content, model, costPerThousandTokensOutput);

    return content;
  } catch (error: any) {
    console.error(error.response || error); // Log the full error response
    throw new Error(
      `Error ${error.response.status}: ${error.response.statusText}`
    );
  }
}

export function getTotalCost() {
  return totalCost;
}

// This function queries the Bing Search API with a given search term and returns an array of search results.
export async function queryBingSearchAPI(searchTerm: string) {
  try {
    const response = await axios.get(
      "https://api.bing.microsoft.com/v7.0/search",
      {
        params: {
          q: searchTerm,
        },
        headers: {
          "Ocp-Apim-Subscription-Key": BING_API_KEY,
        },
      }
    );

    return response.data.webPages.value;
  } catch (error: any) {
    console.error(`Error querying Bing API: ${error.message}`);

    // If the error is a response error, log more details
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }

    throw error;
  }
}
