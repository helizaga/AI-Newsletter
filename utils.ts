// utils.ts
import puppeteer from "puppeteer";

// This function scrapes web content from a given URL and returns the cleaned text.
export async function scrapeWebContent(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract the text content of the relevant elements
  const content = await page.evaluate(() => {
    let text = "";
    const elements = document.querySelectorAll("p, h1, h2, h3, article");
    for (const element of elements) {
      // Skip if the element is a script tag
      if (element.tagName.toLowerCase() !== "script") {
        text += element.textContent + "\n";
      }
    }
    return text;
  });
  // Clean the text
  const cleanedContent = cleanText(content);

  await browser.close();
  return cleanedContent;
}
// This function cleans raw text by trimming whitespace and removing extra spaces.
export function cleanText(text: string): string {
  // Remove HTML tags
  let cleanedText = text.replace(/<[^>]*>/g, " ");

  // Decode HTML entities
  cleanedText = cleanedText.replace(/&amp;/g, "&");
  cleanedText = cleanedText.replace(/&lt;/g, "<");
  cleanedText = cleanedText.replace(/&gt;/g, ">");
  cleanedText = cleanedText.replace(/&quot;/g, '"');
  cleanedText = cleanedText.replace(/&#039;/g, "'");

  // Remove extra whitespace
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();

  return cleanedText;
}
