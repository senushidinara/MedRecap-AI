import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { StudyGuide, QuizSession } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Simple retry wrapper for API calls to handle transient network/server errors
async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn("Gemini API call failed, retrying...", error);
      // Exponential backoff: 1500ms, then 3000ms
      await new Promise(resolve => setTimeout(resolve, 1500 * (3 - retries)));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export const createChatSession = (topic: string): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are an expert medical tutor helping a student study "${topic}". 
      Your goal is to explain complex concepts simply, provide analogies, and answer questions accurately.
      Use the Google Search tool to find up-to-date information, clinical guidelines, or recent papers if the user asks about them or if standard knowledge might be outdated.
      Always cite your sources if you use the search tool.
      If the user asks for images, describe them vividly or explain that you can generate diagrams in the main study view, but for now, you can provide detailed text explanations and search links.`,
      tools: [{ googleSearch: {} }],
    },
  });
};

export const generateMedicalContent = async (topic: string): Promise<StudyGuide> => {
  const ai = getAiClient();
  
  // Structured output focused on Clinical Anatomy and Retention
  // Update: Explicitly requested flowcharts and bullet points to reduce density.
  const prompt = `
    Create a high-yield Clinical Anatomy and Medical review guide for: "${topic}".
    
    The goal is to help doctors maximize retention of complex anatomical and physiological concepts by bridging "Basic Science" with "Clinical Relevance".
    Avoid dense walls of text. Use bullet points or short paragraphs where possible.

    For each sub-section (e.g., if topic is Heart: Coronary Blood Supply, Valves, Conduction System), provide:
    1. Foundational: Detailed anatomy, embryology, or physiology (First Year level). **CRITICAL:** Include Surface Anatomy & Landmarks.
    2. Clinical: The "Third Year" application. What goes wrong? (e.g., specific infarct territories, nerve palsies).
    3. Mermaid Chart: A visual flowchart (graph TD) to represent the flow, pathway, or hierarchy. **IMPORTANT:** Enclose all text inside node brackets [] with double quotes. Example: A["Left (L)"] --> B["Right (R)"].
    4. Key Points: 2-3 rapid-fire facts.
    5. Mnemonics: A specific memory aid.
    6. Matching Pairs: 3-4 pairs for active recall.
    
    Also provide a brief, high-level overview of the topic and 2 "Next Step" related topics for a predictive study pathway.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class medical educator specializing in Gross Anatomy and Clinical Pathology. Your goal is to make complex topics 'stick' using high-yield facts, visual flowcharts (Mermaid.js), and active recall games.",
        responseMimeType: "application/json",
        temperature: 0.4, // Reduced temperature for stability
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            overview: { type: Type.STRING },
            relatedTopics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Predictive Pathway: Suggest 2 related topics the student should study next."
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  foundational: { type: Type.STRING },
                  clinical: { type: Type.STRING },
                  mermaidChart: { 
                    type: Type.STRING, 
                    description: "Mermaid.js graph syntax (e.g. 'graph TD; A[\"Start\"]-->B[\"End\"]'). Use double quotes for node text." 
                  },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  mnemonics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of memory aids or acronyms"
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING }
                      },
                      required: ["term", "definition"]
                    }
                  }
                },
                required: ["title", "foundational", "clinical", "mermaidChart", "keyPoints", "mnemonics", "matchingPairs"]
              }
            }
          },
          required: ["topic", "overview", "sections", "relatedTopics"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate content");
    }

    return JSON.parse(response.text) as StudyGuide;
  });
};

export const generateQuizQuestions = async (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): Promise<QuizSession> => {
  const ai = getAiClient();
  
  const prompt = `Generate 5 USMLE Step 1/Step 2 CK style clinical vignette questions regarding: ${topic}. 
  Difficulty Level: ${difficulty}.
  
  Focus on:
  1. Clinical anatomy correlations.
  2. Differentiating similar pathologies.
  3. ${difficulty === 'Hard' ? 'Third-order reasoning and obscure presentations' : 'Foundational concepts'}.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of 4 or 5 potential answers"
                  },
                  correctAnswer: { 
                    type: Type.INTEGER, 
                    description: "Zero-based index of the correct option" 
                  },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate quiz");
    }

    return JSON.parse(response.text) as QuizSession;
  });
};

export const generateAnatomyImage = async (topic: string, section: string): Promise<string> => {
  const ai = getAiClient();
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Detailed medical anatomical diagram of ${section} in the context of ${topic}. Clean, professional textbook style illustration. White background. Clearly labeled structures. High resolution, educational.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated");
  });
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = getAiClient();
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
}
