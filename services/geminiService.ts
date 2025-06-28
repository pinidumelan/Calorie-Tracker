
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NutritionInfo, NutritionError } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64,
            mimeType
        },
    };
};

export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<NutritionInfo | NutritionError> => {
    const model = "gemini-2.5-flash-preview-04-17";
    
    const prompt = `
        You are a highly intelligent nutrition analysis expert. Your task is to analyze the image of the food provided and return a detailed nutritional breakdown.

        Based on the food items you identify in the image, estimate the serving size and provide the following nutritional information in a strict JSON format. Do not add any explanatory text before or after the JSON object. Do not use markdown.

        The JSON object must follow this exact structure:
        {
          "foodName": "A descriptive name of the dish or food items",
          "calories": <total estimated calories in kcal>,
          "protein": <estimated protein in grams>,
          "carbohydrates": {
            "total": <total estimated carbohydrates in grams>,
            "sugar": <estimated sugar in grams>,
            "fiber": <estimated fiber in grams>
          },
          "fat": {
            "total": <total estimated fat in grams>,
            "saturated": <estimated saturated fat in grams>
          },
          "servingSize": "Your estimation of the serving size (e.g., '1 bowl, approx. 300g')"
        }

        If you cannot identify the food or estimate its nutritional value, return a JSON object with an error field:
        {
          "error": "Could not identify the food in the image."
        }

        Analyze the provided image and return only the JSON.
    `;

    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const textPart = { text: prompt };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr);
        return parsedData as NutritionInfo | NutritionError;

    } catch (e) {
        console.error("Failed to analyze image with Gemini API:", e);
        if (e instanceof Error) {
            return { error: `API Error: ${e.message}` };
        }
        return { error: "An unknown error occurred while analyzing the image." };
    }
};
