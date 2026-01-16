
// Always use correct import for GoogleGenAI
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SimulationResult } from '../types';

// API key must be used directly from process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSimulation = async (result: SimulationResult): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Analiza esta simulación de la Teoría ABC de Gravedad Cuántica.
    Parámetros: a=${result.config.params.a}, b=${result.config.params.b}, c=${result.config.params.c}
    Resultados:
    - Masa Electrón predicha: ${result.metrics.electronMass.predicted} MeV (Error: ${result.metrics.electronMass.error.toFixed(2)}%)
    - Masa Protón predicha: ${result.metrics.protonMass.predicted} MeV (Error: ${result.metrics.protonMass.error.toFixed(2)}%)
    - Constante G predicha: ${result.metrics.G.predicted} (Error: ${result.metrics.G.error.toFixed(2)}%)
    - Coincidencia Global: ${result.metrics.matchPercentage.toFixed(2)}%

    Basado en la Torsión de Cartan y la red relacional, ¿cómo debería el investigador Edward Pérez López ajustar los valores a, b o c para que la masa del electrón sea más precisa? 
    Explica la relación entre la deformación geométrica observada en los nodos excitados y la curvatura de Schwarzschild.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });

  // Always access .text property directly
  return response.text || "No se pudo generar el análisis.";
};

export const chatWithAssistant = async (message: string, history: any[]): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'Eres un experto en la Teoría ABC de Gravedad Cuántica y el asistente de Edward Pérez López. Tu conocimiento se basa en que la gravedad es una propiedad emergente de una red relacional de nodos a, b y c. Eres crítico, científico y enfocado en la precisión matemática.',
      tools: [{ googleSearch: {} }]
    }
  });

  const response = await chat.sendMessage({ message });
  // Always access .text property directly
  return response.text || "Error de comunicación con el núcleo R-QNT.";
};
