import axios from "axios";
import { config } from "dotenv";
import https from "https";

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
// apiClients.js

export async function queryBingSearchAPI(searchTerm) {
  const SUBSCRIPTION_KEY = BING_API_KEY;
  if (!SUBSCRIPTION_KEY) {
    throw new Error("BING_API_KEY is not set.");
  }

  return new Promise((resolve, reject) => {
    https.get(
      {
        hostname: "api.bing.microsoft.com",
        path: "/v7.0/search?q=" + encodeURIComponent(searchTerm),
        headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
      },
      (res) => {
        let body = "";
        res.on("data", (part) => (body += part));
        res.on("end", () => {
          const result = JSON.parse(body);
          console.log(result);
          resolve(result.webPages.value);
        });
        res.on("error", (e) => {
          console.error("Error:", e.message);
          reject(e);
        });
      }
    );
  });
}
