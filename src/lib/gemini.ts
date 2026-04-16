import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  // Check process.env (defined in vite.config.ts)
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return null;
};

const apiKey = getApiKey();

// Initialize the SDK
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const chatWithGemini = async (message: string) => {
  if (!genAI) {
    console.warn("Gemini is not configured (missing API Key).");
    return "Gemini não está configurado. Verifique a chave de API.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text() || "Sem resposta da IA.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação.";
  }
};
