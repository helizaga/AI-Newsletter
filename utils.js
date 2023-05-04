import axios from "axios";
import { load } from "cheerio";

// This function scrapes the web content from a given URL.
export async function scrapeWebContent(url) {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    const pageText = $("body").text();
    return pageText;
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error.message);
    throw error;
  }
}

// This function cleans the input rawText by removing extra spaces and trimming it.
export function cleanText(rawText) {
  return rawText.trim().replace(/\s\s+/g, " ");
}
