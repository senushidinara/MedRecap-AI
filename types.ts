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
  keyPoints: string[];
  mnemonics: string[];  // Memory aids for retention
  matchingPairs: MatchingPair[]; // For the matching mini-game
}

export interface StudyGuide {
  topic: string;
  overview: string;
  sections: ClinicalSection[];
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