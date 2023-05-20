# Personalized Newsletter Generator

This codebase is designed to generate personalized academic newsletters based on a given search term. It utilizes GPT to create a customized newsletter with engagement metrics, links to articles, short summaries, and other relevant sections. The codebase is organized into several modules, each responsible for a specific task in the data processing pipeline.

## Modules

### gpt4.js

This module contains the `generateContentWithGPT4` function, which takes a search term and processed data as input and generates a personalized academic newsletter using GPT.

### main.js

This module contains the `generatePersonalizedContent` function, which is the main entry point for generating personalized content. It calls the data processing pipeline and GPT content generation functions.

### TextRank.js

This module contains the `TextRank` class, which is used to summarize raw text using the TextRank algorithm. The `summarizeText` function takes raw text and a summary length as input and returns a summarized version of the text.

### dataProcessing.js

This module contains the `dataProcessingPipeline` function, which is responsible for processing raw text data. It calls the Bing Search API, scrapes web content, and processes the raw text using TextRank and text cleaning functions.

### utils.js

This module contains utility functions, such as `scrapeWebContent` for scraping web content from a given URL and `cleanText` for cleaning raw text.

### apiClients.js

This module contains API client functions, such as `generateChatCompletion` for generating chat completions using GPT-4 and `queryBingSearchAPI` for querying the Bing Search API.

## Usage

To use this codebase, follow these steps:

1. Install the required dependencies, such as axios and CognitiveServicesCredentials.
2. Set up the necessary API keys and endpoints for GPT-4 and Bing Search API.
3. Call the `generatePersonalizedContent` function with a search term to generate a personalized academic newsletter.

## Example

```javascript
(async () => {
  const searchTerm = "artificial intelligence";
  const personalizedContent = await generatePersonalizedContent(searchTerm, reason);
  console.log(personalizedContent);
})();
```
This example will generate a personalized newsletter based on the search term "artificial intelligence" for the the purpose for "reason".
