
import { GoogleGenAI, Type } from "@google/genai";
import type { Article, GraphData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface RawArticle {
  title: string;
  uri: string;
}

export async function fetchNews(topic: string): Promise<RawArticle[]> {
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: `Find the top 5-7 most important and recent news articles about "${topic}".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!groundingChunks || groundingChunks.length === 0) {
      return [];
    }

    const articles = groundingChunks.map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri,
    }));
    return articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Failed to fetch news from Google Search.");
  }
}


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        articles: {
            type: Type.ARRAY,
            description: "List of articles, each with a title, summary, relevance score, and a unique ID based on its title.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique slug-like ID derived from the article title." },
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING, description: "A concise 2-3 sentence summary of the article." },
                    relevanceScore: { type: Type.INTEGER, description: "A score from 1-100 indicating relevance to the main topic." },
                },
                required: ["id", "title", "summary", "relevanceScore"],
            },
        },
        keywords: {
            type: Type.ARRAY,
            description: "A list of 10-15 important and relevant keywords from all articles.",
            items: { type: Type.STRING },
        },
        graphData: {
            type: Type.OBJECT,
            description: "Data for a topic relationship graph.",
            properties: {
                nodes: {
                    type: Type.ARRAY,
                    description: "Nodes representing the main topic, people, organizations, and concepts.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "The name of the entity." },
                            group: { type: Type.STRING, description: "e.g., 'topic', 'person', 'organization', 'concept'" },
                        },
                        required: ["id", "group"],
                    },
                },
                links: {
                    type: Type.ARRAY,
                    description: "Links showing relationships between nodes.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            source: { type: Type.STRING, description: "The ID of the source node." },
                            target: { type: Type.STRING, description: "The ID of the target node." },
                            label: { type: Type.STRING, description: "A brief description of the relationship (e.g., 'collaborated with', 'funded')." },
                        },
                        required: ["source", "target", "label"],
                    },
                },
            },
            required: ["nodes", "links"],
        },
    },
    required: ["articles", "keywords", "graphData"],
};

export async function rankAndAnalyze(
  topic: string,
  rawArticles: RawArticle[]
): Promise<{ articles: Article[]; keywords: string[]; graphData: GraphData }> {
  const model = 'gemini-2.5-flash';
  const articleContext = rawArticles.map((a, i) => `Article ${i+1}: "${a.title}"`).join("\n");

  const prompt = `
    Analyze the following news articles related to the topic "${topic}".

    Articles:
    ${articleContext}

    Based on all articles provided, perform these tasks:
    1.  For each article, write a 2-3 sentence summary and assign a relevance score (1-100) based on its importance and directness to the topic. Create a unique slug-like ID for each from its title.
    2.  Extract a combined list of the 10-15 most significant keywords from all articles.
    3.  Create a knowledge graph. The main topic "${topic}" should be the central node. Identify key people, organizations, and concepts from the articles as other nodes. Create links that describe their relationships. Keep the graph to about 5-8 nodes and 5-10 links for clarity.
    
    Return the result in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const resultText = response.text;
    const resultJson = JSON.parse(resultText);

    // Combine original URI with processed data
    const finalArticles: Article[] = resultJson.articles.map((processedArticle: any) => {
        const originalArticle = rawArticles.find(raw => 
            processedArticle.title.toLowerCase().includes(raw.title.toLowerCase()) || 
            raw.title.toLowerCase().includes(processedArticle.title.toLowerCase())
        );
        return {
            ...processedArticle,
            url: originalArticle?.uri || '#',
            source: originalArticle ? new URL(originalArticle.uri).hostname : 'Unknown',
        };
    });
    
    // Add value for graph links, required by D3
    const finalGraphData: GraphData = {
        nodes: resultJson.graphData.nodes,
        links: resultJson.graphData.links.map((link: any) => ({...link, value: 1}))
    };

    return {
      articles: finalArticles,
      keywords: resultJson.keywords,
      graphData: finalGraphData,
    };
  } catch (error) {
    console.error("Error analyzing articles:", error);
    throw new Error("Failed to analyze articles with Gemini.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A visually appealing and abstract, journalistic-style image representing the news article titled: "${prompt}"`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    // Return an empty string if image generation fails to not break the UI
    return ""; 
  }
}