import axios from "axios";
import { config } from "dotenv";
import * as https from "https";

config(); // Load environment variables from .env file

const GPT_API_KEY = process.env.GPT_API_KEY as string;
const BING_API_KEY = process.env.BING_API_KEY as string;
const GPT_API_ENDPOINT: string = "https://api.openai.com/v1/chat/completions";

interface Message {
  role: string;
  content: string;
}

// This function generates a chat completion using the GPT API.
// It takes an array of messages, a model, temperature, and max tokens as input.
export async function generateChatCompletion(
  messages: Message[],
  model: string = "gpt-3.5-turbo",
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
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error(error.response || error); // Log the full error response
    throw new Error(
      `Error ${error.response.status}: ${error.response.statusText}`
    );
  }
}

// This function queries the Bing Search API with a given search term and returns an array of search results.
export async function queryBingSearchAPI(searchTerm: string): Promise<any[]> {
  const SUBSCRIPTION_KEY: string = BING_API_KEY;
  if (!SUBSCRIPTION_KEY) {
    throw new Error("BING_API_KEY is not set.");
  }

  try {
    const response = await axios.get(
      "https://api.bing.microsoft.com/v7.0/news/search",
      {
        params: {
          q: searchTerm,
        },
        headers: {
          "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        },
      }
    );

    if (response.data.value) {
      return response.data.value;
    } else {
      console.error("Unexpected API response:", response.data);
      throw new Error("Unexpected API response");
    }
  } catch (error: any) {
    console.error(error.response || error);
    throw new Error(
      `Error ${error.response.status}: ${error.response.statusText}`
    );
  }
}
