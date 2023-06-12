# Personalized Content Generator

This project is a personalized content generator that utilizes GPT-3.5 and Bing Search API to create customized newsletters for users based on their interests and preferences. The generator scrapes web content, processes the data, and generates summaries using GPT-3.5. It then creates a comprehensive and engaging newsletter in the style of a Medium post.

## Table of Contents
1. [Features](#features)
2. [Dependencies](#dependencies)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Data Processing Pipeline](#data-processing-pipeline)
6. [Examples](#examples)
7. [License](#license)

## Features <a name="features"></a>
- Generate optimal Bing search queries using GPT-3.5
- Scrape web content and process the data
- Summarize articles using GPT-3.5
- Create engaging newsletters in the style of a Medium post

## Dependencies <a name="dependencies"></a>
- axios
- boilerpipe
- GPT-4 API
- Bing Search API

## Installation <a name="installation"></a>
1. Clone the repository:
    ```
    git clone https://github.com/yourusername/personalized-content-generator.git
    ```
2. Install the dependencies:
    ```
    npm install
    ```
3. Set up the environment variables:

    Create a `.env` file in the root directory and add the following variables:
    ```
    GPT_API_KEY=your_gpt_api_key
    BING_API_KEY=your_bing_api_key
    ```
    Replace `your_gpt_api_key` and `your_bing_api_key` with your respective API keys.

## Usage <a name="usage"></a>
To run the generator, execute the following command:

```
npm start
```

This will run the displayContent() function in main.ts, which generates a personalized newsletter based on the given search term and reason.

Data Processing Pipeline <a name="data-processing-pipeline"></a>
The data processing pipeline consists of the following steps:

1. Generate the optimal Bing search query using GPT-3.5 based on the user's search term and reason.
2. Query the Bing Search API with the generated search query.
3. Scrape web content from the search results using the boilerpipe library.
4. Clean and process the scraped text.
5. Generate summaries of the articles using GPT-3.5.
6. Create a comprehensive and engaging newsletter using GPT-3.5.

## Examples <a name="examples"></a>
To generate a personalized newsletter about upcoming sneaker releases, you can call the generatePersonalizedContent() function with the following parameters:

```
generatePersonalizedContent(
  "upcoming sneaker releases",
  "be able to buy the shoes at the retail price"
);
```

This will generate a newsletter with information about upcoming sneaker releases, tailored to help the user buy the shoes at the retail price.

## License <a name="license"></a>
This project is licensed under the MIT License.
