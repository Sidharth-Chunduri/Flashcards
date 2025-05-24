export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
  lastReviewed?: number;
  nextReview?: number;
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  easeFactor?: number;
  interval?: number;
}

export interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
  lastReviewed?: number;
}

export interface QuizResult {
  deckId: string;
  correctAnswers: number;
  totalCards: number;
  date: number;
}

export interface QuizletTerm {
  term: string;
  definition: string;
}

export interface QuizletSet {
  title: string;
  terms: QuizletTerm[];
}

export interface ReviewSession {
  id: string;
  deckId: string;
  cards: string[];
  createdAt: number;
  completedAt?: number;
  results?: {
    cardId: string;
    correct: boolean;
    timeSpent: number;
  }[];
}

export const SR_CONSTANTS = {
  INITIAL_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  INITIAL_INTERVAL: 1,
  GRADE_WEIGHTS: {
    AGAIN: 0,
    HARD: 0.5,
    GOOD: 1,
    EASY: 1.3
  }
}; 