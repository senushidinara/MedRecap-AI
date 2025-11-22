import { GoogleGenAI, Type } from "@google/genai";
import { StudyGuide, QuizSession } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMedicalContent = async (topic: string): Promise<StudyGuide> => {
  const ai = getAiClient();
  
  // Structured output focused on Clinical Anatomy and Retention
  const prompt = `
    Create a high-yield Clinical Anatomy and Medical review guide for: "${topic}".
    
    The goal is to help doctors maximize retention of complex anatomical and physiological concepts by bridging "Basic Science" with "Clinical Relevance".
    
    For each sub-section (e.g., if topic is Heart: Coronary Blood Supply, Valves, Conduction System), provide:
    1. Foundational: Detailed anatomy, embryology, or physiology (First Year level). **CRITICAL:** Include Surface Anatomy & Landmarks (e.g., surface projections, auscultation points, vertebral levels) where relevant. Focus on spatial relationships.
    2. Clinical: The "Third Year" application. What goes wrong? (e.g., specific infarct territories, nerve palsies, surgical landmarks, procedural anatomy).
    3. Key Points: 2-3 rapid-fire facts.
    4. Mnemonics: A specific memory aid, acronym, or clever association to help remember the anatomy or list of structures.
    5. Matching Pairs: Provide 3-4 pairs of terms vs definitions/functions for an active recall game (e.g., "SA Node" -> "Pacemaker", "LAD Artery" -> "Supplies Anterior Septum").
    
    Also provide a brief, high-level overview of the topic.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a world-class medical educator specializing in Gross Anatomy and Clinical Pathology. Your goal is to make complex topics 'stick' using high-yield facts, memorable mnemonics, and active recall games.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          overview: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                foundational: { type: Type.STRING },
                clinical: { type: Type.STRING },
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
              required: ["title", "foundational", "clinical", "keyPoints", "mnemonics", "matchingPairs"]
            }
          }
        },
        required: ["topic", "overview", "sections"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate content");
  }

  return JSON.parse(response.text) as StudyGuide;
};

export const generateQuizQuestions = async (topic: string): Promise<QuizSession> => {
  const ai = getAiClient();
  
  const prompt = `Generate 5 USMLE Step 1/Step 2 CK style clinical vignette questions regarding: ${topic}. 
  
  Focus on:
  1. Clinical anatomy correlations (e.g., "A patient presents with... which structure is likely damaged?")
  2. Differentiating similar pathologies.
  3. Second/Third-order reasoning (don't just ask "what is this", ask "what is the mechanism of the likely diagnosis").
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
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
};

export const generateAnatomyImage = async (topic: string, section: string): Promise<string> => {
  const ai = getAiClient();
  
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
};