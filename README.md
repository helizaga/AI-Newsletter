# Personalized Newsletter Generator

This project is a personalized newsletter generator that uses GPT-4 and Bing Search API to create a customized newsletter for a user based on their interests. The newsletter is generated in the style of a Medium post and includes articles designed to get massive engagement. Each article is summarized and includes an analysis of why it's important for the reader to know. The newsletter also includes a call to action and provides insight on recommendations.

## How it works

The code is organized into several TypeScript files, each responsible for a specific part of the process:

- `main.ts`: The entry point of the application. It calls the `generatePersonalizedContent` function with the user's search term and reason for the newsletter.
- `gpt.ts`: Contains the `generateContentWithGPT` function, which takes the search term, reason, and processed data as input and generates the newsletter using GPT.
- `dataProcessing.ts`: Contains the `dataProcessingPipeline` function, which processes the search results and extracts the relevant content.
- `apiClients.ts`: Contains functions to interact with external APIs, such as Bing Search API and GPT API.
- `TextRank.ts`: Implements the TextRank algorithm for summarizing text.
- `utils.ts`: Contains utility functions for cleaning and scraping web content.

The main flow of the application is as follows:

1. The user provides a search term and a reason for the newsletter.
2. The application queries the Bing Search API to get relevant search results.
3. The content of the search results is scraped and processed using the TextRank algorithm to generate summaries.
4. The processed data is passed to the GPT API, which generates the personalized newsletter based on the user's search term, reason, and the processed data.

## How to run the project

Before running the project, make sure you have the following prerequisites:

- Node.js and npm installed on your system.
- API keys for Bing Search API and GPT API.

Follow these steps to run the project:

1. Clone the repository to your local machine.
2. Navigate to the project directory and run `npm install` to install the required dependencies.
3. Create a `.env` file in the project root and add the following environment variables with your API keys:

```env
BING_API_KEY=<your_bing_api_key>
GPT_API_KEY=<your_gpt_api_key>
```

4. Compile the TypeScript files by running `npm run build`.
5. Run the project using `npm start`.

The application will generate a personalized newsletter based on the user's search term and reason provided in the main.ts file. The generated newsletter will be printed to the console.

