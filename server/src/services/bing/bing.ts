import axios from "axios";
import { config } from "dotenv";

config(); // Load environment variables from .env file

const BING_API_KEY = process.env.BING_API_KEY as string;
const USE_MOCKS = process.env.USE_MOCKS === "true"; // Add this line

// This function queries the Bing Search API with a given search term and returns an array of search results.
export async function queryBingSearchAPI(topic: string) {
  if (USE_MOCKS) {
    return mockQueryBingSearchAPI(topic);
  }

  try {
    const response = await axios.get(
      "https://api.bing.microsoft.com/v7.0/search",
      {
        params: {
          q: topic,
        },
        headers: {
          "Ocp-Apim-Subscription-Key": BING_API_KEY,
        },
      }
    );

    return response.data.webPages.value;
  } catch (error: any) {
    console.error(`Error querying Bing API: ${error.message}`);

    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }

    throw error;
  }
}

// Mock function
async function mockQueryBingSearchAPI(topic: string) {
  console.log("Mock queryBingSearchAPI called with:", { topic });
  return [
    { url: "http://dummy1.com" },
    { url: "http://dummy2.com" },
    { url: "http://dummy3.com" },
    { url: "http://dummy4.com" },
    // Add more dummy URLs
  ];
}
