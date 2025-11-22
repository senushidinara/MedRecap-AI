import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { StudyGuide, QuizSession } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn("Gemini API call failed, retrying...", error);
      await new Promise(resolve => setTimeout(resolve, 1500 * (3 - retries)));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

const generateMockStudyGuide = (topic: string): StudyGuide => {
  return {
    topic,
    overview: `This is a sample study guide for ${topic}. Connect an API key to generate AI-powered content.`,
    sections: [
      {
        title: "Foundational Concepts",
        foundational: "This section covers the basic anatomy and physiology related to the topic.",
        clinical: "Here we explore the clinical relevance and real-world applications.",
        mermaidChart: 'graph TD\n  A["Basic Concept"] --> B["Application"]\n  B --> C["Clinical Outcome"]',
        keyPoints: [
          "Key point 1: Understanding fundamentals",
          "Key point 2: Clinical correlation",
          "Key point 3: Memory aid"
        ],
        mnemonics: [
          "Mnemonic 1: Create associations",
          "Mnemonic 2: Use visual memory"
        ],
        matchingPairs: [
          { term: "Anatomy", definition: "The study of body structures" },
          { term: "Physiology", definition: "The study of body functions" },
          { term: "Pathology", definition: "The study of disease processes" }
        ]
      }
    ],
    relatedTopics: ["Related Topic 1", "Related Topic 2"]
  };
};

const generateMockQuizSession = (topic: string): QuizSession => {
  return {
    questions: [
      {
        question: `Which of the following best describes a key concept in ${topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is correct based on established medical knowledge."
      },
      {
        question: `A patient presents with a clinical scenario related to ${topic}. What is the diagnosis?`,
        options: ["Diagnosis A", "Diagnosis B", "Diagnosis C", "Diagnosis D"],
        correctAnswer: 1,
        explanation: "Based on clinical presentation and differential diagnosis."
      },
      {
        question: `Which anatomical structure is most important in ${topic}?`,
        options: ["Structure A", "Structure B", "Structure C", "Structure D"],
        correctAnswer: 2,
        explanation: "This structure plays the central role in pathophysiology."
      },
      {
        question: `What is the embryological origin in ${topic}?`,
        options: ["Ectoderm", "Mesoderm", "Endoderm", "All three"],
        correctAnswer: 1,
        explanation: "Understanding embryological origin is crucial."
      },
      {
        question: `What complication is most common in ${topic}?`,
        options: ["Complication A", "Complication B", "Complication C", "Complication D"],
        correctAnswer: 0,
        explanation: "This is the most frequently encountered complication."
      }
    ]
  };
};

export const createChatSession = (topic: string): Chat | null => {
  const ai = getAiClient();
  if (!ai) {
    return null;
  }
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are an expert medical tutor helping a student study "${topic}".`,
      tools: [{ googleSearch: {} }],
    },
  });
};

export const generateMedicalContent = async (topic: string): Promise<StudyGuide> => {
  const ai = getAiClient();
  
  if (!ai) {
    return generateMockStudyGuide(topic);
  }

  const prompt = `Create a high-yield Clinical Anatomy and Medical review guide for: "${topic}".`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class medical educator.",
        responseMimeType: "application/json",
        temperature: 0.4,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            overview: { type: Type.STRING },
            relatedTopics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  foundational: { type: Type.STRING },
                  clinical: { type: Type.STRING },
                  mermaidChart: { type: Type.STRING },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  mnemonics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
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
  
  if (!ai) {
    return generateMockQuizSession(topic);
  }

  const prompt = `Generate 5 USMLE style questions for ${topic} at ${difficulty} level.`;

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
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER },
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
  
  if (!ai) {
    return "";
  }
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Medical anatomical diagram of ${section} in ${topic}.`,
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
  
  if (!ai) {
    return undefined;
  }
  
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
};
