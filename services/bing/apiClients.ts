import axios from "axios";
import { config } from "dotenv";

config(); // Load environment variables from .env file

const BING_API_KEY = process.env.BING_API_KEY as string;

// This function queries the Bing Search API with a given search term and returns an array of search results.
export async function queryBingSearchAPI(searchTerm: string) {
  return [
    { url: "http://dummy1.com" },
    { url: "http://dummy2.com" },
    // Add more dummy URLs
  ];
  // Uncomment the following code to use the real Bing API.
  // try {
  //   const response = await axios.get(
  //     'https://api.bing.microsoft.com/v7.0/search',
  //     {
  //       params: {
  //         q: searchTerm,
  //       },
  //       headers: {
  //         'Ocp-Apim-Subscription-Key': BING_API_KEY,
  //       },
  //     }
  //   );

  //   return response.data.webPages.value;
  // } catch (error: any) {
  //   console.error(`Error querying Bing API: ${error.message}`);

  //   if (error.response) {
  //     console.error(`Response status: ${error.response.status}`);
  //     console.error(`Response data: ${JSON.stringify(error.response.data)}`);
  //   }

  //   throw error;
  // }
}
