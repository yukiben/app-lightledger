
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseSemanticInput(input: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following user bookkeeping input and extract the amount, category, and a short note.
      Input: "${input}"
      Rules:
      1. amount: the number (if found).
      2. category: one of [餐饮, 交通, 购物, 居住, 文化, 旅游, 数码, 其他].
      3. note: what the user actually spent on.
      
      Example: "午饭35" -> { amount: 35, category: "餐饮", note: "午饭" }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            note: { type: Type.STRING }
          },
          required: ["amount", "category", "note"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Semantic parsing error:", error);
    return null;
  }
}
