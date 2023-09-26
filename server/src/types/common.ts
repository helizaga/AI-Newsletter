export interface ArticleData {
  url: string;
  text: string;
  relevanceScore?: number; // Add this line
}

export interface Message {
  role: string;
  content: string;
}
