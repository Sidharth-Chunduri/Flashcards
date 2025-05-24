import { Deck, Flashcard, SR_CONSTANTS } from '../types';

/**
 * Calculate the next review date using the SM-2 spaced repetition algorithm
 */
export function calculateNextReview(
  card: Flashcard,
  grade: keyof typeof SR_CONSTANTS.GRADE_WEIGHTS
): { nextReview: number; easeFactor: number; interval: number } {
  const weight = SR_CONSTANTS.GRADE_WEIGHTS[grade];
  const easeFactor = card.easeFactor || SR_CONSTANTS.INITIAL_EASE_FACTOR;
  const interval = card.interval || SR_CONSTANTS.INITIAL_INTERVAL;

  // Calculate new ease factor
  const newEaseFactor = Math.max(
    SR_CONSTANTS.MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - weight) * (0.08 + (5 - weight) * 0.02))
  );

  // Calculate new interval
  let newInterval = interval;
  if (weight < 0.5) { // Failed
    newInterval = SR_CONSTANTS.INITIAL_INTERVAL;
  } else if (interval === SR_CONSTANTS.INITIAL_INTERVAL) {
    newInterval = 6; // First success: 6 days
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }

  // Calculate next review date
  const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return {
    nextReview,
    easeFactor: newEaseFactor,
    interval: newInterval
  };
}

/**
 * Get cards that are due for review today
 */
export function getDueCards(deck: Deck): Flashcard[] {
  const now = Date.now();
  return deck.cards.filter(card => {
    // Include cards that:
    // 1. Have never been reviewed
    // 2. Are due for review
    // 3. Were previously marked incorrect
    return (
      !card.lastReviewed ||
      (card.nextReview && card.nextReview <= now) ||
      ((card.incorrectCount || 0) > (card.correctCount || 0))
    );
  });
}

/**
 * Generate a daily review session
 */
export function generateDailyReview(deck: Deck, maxCards: number = 20): Flashcard[] {
  const dueCards = getDueCards(deck);
  
  // Sort cards by priority:
  // 1. Overdue cards
  // 2. Cards with more incorrect than correct answers
  // 3. Never reviewed cards
  // 4. Recently added cards
  const now = Date.now();
  const sortedCards = dueCards.sort((a, b) => {
    // Calculate priority scores
    const getScore = (card: Flashcard): number => {
      let score = 0;
      
      // Overdue cards
      if (card.nextReview && card.nextReview < now) {
        score += (now - card.nextReview) / (24 * 60 * 60 * 1000); // Days overdue
      }
      
      // Cards with more incorrect answers
      const incorrectCount = card.incorrectCount || 0;
      const correctCount = card.correctCount || 0;
      if (incorrectCount > correctCount) {
        score += 10 * (incorrectCount - correctCount);
      }
      
      // Never reviewed cards
      if (!card.lastReviewed) {
        score += 5;
      }
      
      // Recently added cards
      const daysSinceCreation = (now - card.createdAt) / (24 * 60 * 60 * 1000);
      if (daysSinceCreation < 7) {
        score += (7 - daysSinceCreation);
      }
      
      return score;
    };
    
    return getScore(b) - getScore(a);
  });

  return sortedCards.slice(0, maxCards);
}

/**
 * Update card review statistics
 */
export function updateCardStats(
  card: Flashcard,
  correct: boolean,
  timeSpent: number
): Flashcard {
  const grade = getGradeFromPerformance(correct, timeSpent);
  const { nextReview, easeFactor, interval } = calculateNextReview(card, grade);
  
  return {
    ...card,
    lastReviewed: Date.now(),
    nextReview,
    easeFactor,
    interval,
    reviewCount: (card.reviewCount || 0) + 1,
    correctCount: (card.correctCount || 0) + (correct ? 1 : 0),
    incorrectCount: (card.incorrectCount || 0) + (correct ? 0 : 1),
  };
}

/**
 * Convert performance metrics to SM-2 grade
 */
function getGradeFromPerformance(correct: boolean, timeSpent: number): keyof typeof SR_CONSTANTS.GRADE_WEIGHTS {
  if (!correct) return 'AGAIN';
  
  // Convert time spent to a rough difficulty measure
  // Assuming average answer time is 10 seconds
  const normalizedTime = timeSpent / 10000; // Convert to seconds and normalize
  
  if (normalizedTime > 2) return 'HARD';
  if (normalizedTime < 0.5) return 'EASY';
  return 'GOOD';
} 