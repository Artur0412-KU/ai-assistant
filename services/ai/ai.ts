import { GoogleGenAI } from "@google/genai";

export const TEXT_MODEL_ID = 'gemini-2.5-flash';
export const IMAGE_MODEL_ID = 'imagen-4.0-generate-001';

const ai = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY
});

export const generateText = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL_ID,
    contents: prompt,
  });

  console.log(response.text)
  return response.text;
};

export const generateAI = generateText;

export const generateImage = async (prompt: string) => {
  const response = await ai.models.generateImages({
    model: IMAGE_MODEL_ID,
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      outputMimeType: 'image/png',
    },
  });

  const generatedImage = response.generatedImages?.[0]?.image;

  if (!generatedImage?.imageBytes) {
    throw new Error('Image generation returned no image data.');
  }

  const mimeType = generatedImage.mimeType ?? 'image/png';

  return `data:${mimeType};base64,${generatedImage.imageBytes}`;
};
