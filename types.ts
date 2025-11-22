export enum ViewState {
  HOME = 'HOME',
  STUDY = 'STUDY',
  QUIZ = 'QUIZ'
}

export interface MatchingPair {
  term: string;
  definition: string;
}

export interface ClinicalSection {
  title: string;
  foundational: string; // The "First Year" content (Anatomy/Physio)
  clinical: string;     // The "Third Year" content (Pathology/Application)
  mermaidChart: string; // Mermaid.js graph syntax for visual flow
  keyPoints: string[];
  mnemonics: string[];  // Memory aids for retention
  matchingPairs: MatchingPair[]; // For the matching mini-game
}

export interface StudyGuide {
  topic: string;
  overview: string;
  sections: ClinicalSection[];
  relatedTopics: string[]; // Predictive Study Pathway: What to learn next
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface UserStats {
  points: number;
  streakDays: number;
  topicsMastered: number;
  lastStudyDate: string; // ISO string
  moodScore?: number; // 1-5 for stress tracking
}

export interface AppSettings {
  highContrast: boolean;
  largeText: boolean;
}
