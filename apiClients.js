import axios from "axios";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import WebSearchAPIClient from "@azure/cognitiveservices-websearch";
import { config } from "dotenv";

config(); // Load environment variables from .env file

const GPT_API_KEY = process.env.GPT_API_KEY;
const GPT_API_ENDPOINT =
  "https://api.openai.com/v1/engines/davinci-codex/completions";
const BING_API_KEY = process.env.BING_API_KEY;

// This function sends a chat completion request to the GPT API.
// It takes messages, model, temperature, and maxTokens as input parameters.
export async function generateChatCompletion(
  messages,
  model = "gpt-4",
  temperature = 0.7,
  maxTokens = null
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GPT_API_KEY}`,
  };

  const data = {
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
  } catch (error) {
    throw new Error(
      `Error ${error.response.status}: ${error.response.statusText}`
    );
  }
}

// This function queries the Bing Search API for a given searchTerm and returns the search results.
export async function queryBingSearchAPI(searchTerm) {
  let credentials = new CognitiveServicesCredentials(BING_API_KEY);
  let webSearchApiClient = new WebSearchAPIClient(credentials);

  try {
    const result = await webSearchApiClient.web.search(searchTerm);
    return result.webPages.value;
  } catch (err) {
    throw err;
  }
}
