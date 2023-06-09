import { generateChatCompletion } from "./apiClients";

interface Message {
  role: "system" | "user";
  content: string;
}

// This function generates content using GPT based on the searchTerm and processedData.
// It creates a chat message structure and calls the generateChatCompletion function to get the response.
async function generateContentWithGPT(
  searchTerm: string,
  reason: string,
  processedData: string[]
): Promise<string> {
  let newsletterContent: string = "";

  for (let i = 0; i < processedData.length; i++) {
    const dataSummary: string = processedData[i];

    let sectionInstruction: string = "";
    if (i === 0) {
      sectionInstruction =
        "- This is the start of the newsletter. Start with an engaging introduction to the newsletter.";
    } else if (i === processedData.length - 1) {
      sectionInstruction = `- End this section with a closing remark for the newsletter.
      - Do not mention any specific company, website, url in the closing remark.`;
    } else {
      sectionInstruction = `- Do not include another introduction in this section. This is the middle of the newsletter.
        - Don't use 'First off', 'First of all', etc. to start this section. Instead, use 'Next', 'Then', etc. to start this section`;
    }

    const messages: Message[] = [
      {
        role: "system",
        content: `You are an AI tasked with creating a customized newsletter for a user. The newsletter should be in the style of a Medium post. Your task includes the following:
        - The newsletter should have several sections, each teaching the reader something new.
        - Each section should transition seamlessly into the next.
        - Embed URLs into the newsletter where appropriate.
        - Ensure the content is comprehensive and engaging for the reader.`,
      },
      {
        role: "user",
        content: `Write a section of the newsletter about ${searchTerm}. Here are the details:
        - Use the text and URL below.
        - Embed the URLs in the article.
        - I want this newsletter because ${reason}.
        - Include a short summary of the article and why it's important for me to know.
        - Include a link to the cited article.
        - Populate using engaging content.
        - Here's a summary of the data: ${JSON.stringify(dataSummary)}
        - ${sectionInstruction}`,
      },
    ];

    const responseText: string = await generateChatCompletion(
      messages,
      "gpt-3.5-turbo",
      0.7,
      4096
    );

    newsletterContent += responseText;
  }

  return newsletterContent;
}

export { generateContentWithGPT };
