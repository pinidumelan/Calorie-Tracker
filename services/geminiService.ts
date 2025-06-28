
import { GoogleGenAI } from "@google/genai";
import { NutritionInfo } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

export const getNutritionInfoFromImage = async (base64Image: string, mimeType: string): Promise<NutritionInfo> => {
  const model = "gemini-2.5-flash-preview-04-17";

  const imagePart = fileToGenerativePart(base64Image, mimeType);
  
  const prompt = `
    Analyze the food item in this image. Act as an expert nutritionist.
    Identify the dish and provide a detailed nutritional analysis for a standard serving size.
    Your response MUST be a single JSON object. Do not include any text, markdown formatting, or code fences before or after the JSON object.
    The JSON object must strictly follow this structure:
    {
      "foodName": "string",
      "servingSize": "string (e.g., '1 cup' or '100g')",
      "calories": number,
      "fat": { "total": number, "unit": "g" },
      "carbohydrates": { "total": number, "unit": "g" },
      "protein": { "total": number, "unit": "g" },
      "vitamins": [{ "name": "string", "amount": "string (value and unit, e.g., '1.2mg')" }]
    }
    If the image does not contain food, return an error in the JSON structure: {"error": "No food detected in the image."}.
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            temperature: 0.2,
        },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if(parsedData.error) {
        throw new Error(parsedData.error);
    }
    
    // Basic validation to ensure the response shape is correct
    if (!parsedData.foodName || !parsedData.calories) {
        throw new Error("Invalid response format from AI. Missing key nutritional data.");
    }

    return parsedData as NutritionInfo;

  } catch (e) {
    console.error("Failed to analyze image with Gemini API:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while analyzing the image.";
    throw new Error(`AI analysis failed: ${errorMessage}`);
  }
};
