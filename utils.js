import axios from "axios";
import { load } from "cheerio";

// This function scrapes the web content from a given URL and cleans it.
export async function scrapeWebContent(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
      },
    });
    const $ = load(data);

    // Remove unnecessary elements using an array of selectors
    const selectorsToRemove = [
      "script",
      "style",
      "header",
      "footer",
      "nav",
      ".nav",
      ".footer",
      ".header",
      ".advertisement",
      ".sidebar",
      ".comments",
      // Add more selectors as needed
    ];

    selectorsToRemove.forEach((selector) => {
      $(selector).remove();
    });

    // Remove extra spaces, newline characters, and other unwanted patterns
    const cleanedText = $("body")
      .text()
      .trim()
      .replace(/\s\s+/g, " ")
      .replace(/\n/g, " ")
      .replace(/[^a-zA-Z0-9\s.,!?'"()]+/g, ""); // remove non-alphanumeric characters except punctuation

    return cleanedText;
  } catch (error) {
    console.error(`Error scraping content from ${url}:`, error.message);
    throw error;
  }
}

// This function cleans the input rawText by removing extra spaces and trimming it.
export function cleanText(rawText) {
  return rawText.trim().replace(/\s\s+/g, " ");
}
