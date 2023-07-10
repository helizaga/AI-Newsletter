import * as puppeteer from "puppeteer";
import he from "he"; // Add this line

let browser: puppeteer.Browser | null = null;

async function getBrowserInstance() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true });
  }
  return browser;
}

// This function scrapes web content from a given URL and returns the cleaned text.
export async function scrapeWebContent(url: string): Promise<string> {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();
  let cleanedContent = "";

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract the text content of the relevant elements
    const content = await page.evaluate(() => {
      let text = "";
      const elements = document.querySelectorAll("p, h1, h2, h3, article");
      for (const element of elements) {
        // Skip if the element is a script tag
        if (element.tagName.toLowerCase() !== "script") {
          text += element.textContent + "\\n";
        }
      }
      return text;
    });

    // Clean the text
    cleanedContent = cleanText(content);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  } finally {
    await page.close();
  }

  return cleanedContent;
}

// This function cleans raw text by trimming whitespace and removing extra spaces.
export function cleanText(text: string): string {
  // Remove HTML tags
  let cleanedText = text.replace(/<[^>]*>/g, " ");

  // Decode HTML entities using the 'he' library
  cleanedText = he.decode(cleanedText);

  // Remove extra whitespace
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  return cleanedText;
}
