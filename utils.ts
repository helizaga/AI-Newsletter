// utils.ts
const boiler = require("boilerpipe-scraper");

export async function scrapeWebContent(url: string): Promise<string> {
  try {
    const text = await new Promise<string>((resolve, reject) => {
      boiler(url, (err, text) => {
        if (err) {
          reject(err);
        } else {
          resolve(text);
        }
      });
    });

    // Remove extra spaces, newline characters, and other unwanted patterns
    const cleanedText = text
      .trim()
      .replace(/\s\s+/g, " ")
      .replace(/\n/g, " ")
      .replace(/[^a-zA-Z0-9\s.,!?'"()]+/g, ""); // remove non-alphanumeric characters except punctuation

    return cleanedText;
  } catch (error) {
    console.error(
      `Error scraping content from ${url}:`,
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

// This function cleans the input rawText by removing extra spaces and trimming it.
export function cleanText(rawText: string): string {
  return rawText.trim().replace(/\s\s+/g, " ");
}
