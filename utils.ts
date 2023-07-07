// utils.ts
const boiler = require("boilerpipe-scraper");

// This function scrapes web content from a given URL and returns the cleaned text.
export async function scrapeWebContent(url: string): Promise<string> {
  try {
    const text = await new Promise<string>((resolve, reject) => {
      // This function wraps the boilerpipe library to scrape web content and returns a promise.
      boiler(
        url,
        // This callback function resolves or rejects a promise based on the success or failure of a text operation.
        (err, text) => {
          if (err) {
            reject(err);
          } else {
            resolve(text);
          }
        }
      );
    });

    const cleanedText = cleanText(text);
    return cleanedText;
  } catch (error) {
    console.error(
      `Error scraping content from ${url}:`,
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}
// This function cleans raw text by trimming whitespace and removing extra spaces.
export function cleanText(rawText: string): string {
  return rawText.trim().replace(/\s\s+/g, " ");
}
