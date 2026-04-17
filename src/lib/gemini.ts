import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return null;
};

const apiKey = getApiKey();

// Initialize the SDK
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const chatWithGemini = async (message: string) => {
  if (!genAI) {
    console.warn("Gemini is not configured (missing API Key).");
    return "Gemini não está configurado. Verifique a chave de API.";
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });
    return response.text || "Sem resposta da IA.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação.";
  }
};
