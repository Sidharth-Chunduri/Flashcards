import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, Surface } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { RootStackScreenProps } from '../navigation/types';
import { Deck, Flashcard, ReviewSession } from '../types';
import { getDecks, saveDeck } from '../utils/storage';
import { generateDailyReview, updateCardStats } from '../utils/spacedRepetition';
import { useSettings } from '../context/SettingsContext';

type Props = RootStackScreenProps<'DailyReview'>;

export default function DailyReviewScreen({ navigation }: Props) {
  const { settings } = useSettings();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const loadedDecks = await getDecks();
      setDecks(loadedDecks);
      await startNewSession(loadedDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async (availableDecks: Deck[]) => {
    // Get due cards from all decks
    let allDueCards: { card: Flashcard; deckId: string }[] = [];
    
    availableDecks.forEach(deck => {
      const dueCards = generateDailyReview(deck);
      allDueCards = allDueCards.concat(
        dueCards.map(card => ({ card, deckId: deck.id }))
      );
    });

    if (allDueCards.length === 0) {
      return; // No cards due for review
    }

    // Create new session
    const session: ReviewSession = {
      id: Date.now().toString(),
      deckId: 'multiple',
      cards: allDueCards.map(({ card }) => card.id),
      createdAt: Date.now(),
      results: []
    };

    setCurrentSession(session);
    showNextCard(allDueCards);
    setStartTime(Date.now());
  };

  const showNextCard = (dueCards: { card: Flashcard; deckId: string }[]) => {
    if (dueCards.length === 0) {
      finishSession();
      return;
    }

    setCurrentCard(dueCards[0].card);
    setShowAnswer(false);
    setStartTime(Date.now());
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentCard || !currentSession) return;

    if (settings.enableHapticFeedback) {
      await Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );
    }

    const timeSpent = Date.now() - startTime;

    // Update card stats
    const updatedCard = updateCardStats(currentCard, correct, timeSpent);

    // Update deck
    const deck = decks.find(d => d.cards.some(c => c.id === currentCard.id));
    if (deck) {
      const updatedDeck = {
        ...deck,
        cards: deck.cards.map(c => c.id === updatedCard.id ? updatedCard : c),
        lastReviewed: Date.now()
      };
      await saveDeck(updatedDeck);
      setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
    }

    // Update session results
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        results: [
          ...(prev.results || []),
          { cardId: currentCard.id, correct, timeSpent }
        ]
      };
    });

    // Show next card
    const remainingCards = decks.flatMap(deck =>
      generateDailyReview(deck).map(card => ({ card, deckId: deck.id }))
    ).filter(({ card }) => !currentSession.results?.some(r => r.cardId === card.id));

    showNextCard(remainingCards);
  };

  const finishSession = () => {
    if (!currentSession) return;

    const totalCards = currentSession.results?.length || 0;
    const correctCards = currentSession.results?.filter(r => r.correct).length || 0;
    const accuracy = totalCards > 0 ? (correctCards / totalCards) * 100 : 0;

    navigation.replace('ReviewSummary', {
      totalCards,
      correctCards,
      accuracy,
      sessionId: currentSession.id
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading review session...</Text>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium">All Caught Up! 🎉</Text>
        <Text variant="bodyLarge" style={styles.message}>
          No cards are due for review right now. Check back later!
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          Back to Home
        </Button>
      </View>
    );
  }

  const progress = currentSession?.results?.length || 0;
  const total = currentSession?.cards.length || 0;

  return (
    <View style={styles.container}>
      <ProgressBar
        progress={progress / total}
        style={styles.progress}
      />
      <Text style={styles.counter}>
        Card {progress + 1} of {total}
      </Text>

      <Surface style={styles.cardContainer} elevation={2}>
        <Text variant="headlineSmall" style={styles.cardText}>
          {showAnswer ? currentCard.answer : currentCard.question}
        </Text>
      </Surface>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => setShowAnswer(!showAnswer)}
          style={styles.button}
        >
          {showAnswer ? 'Show Question' : 'Show Answer'}
        </Button>
      </View>

      {showAnswer && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleAnswer(true)}
            style={[styles.button, styles.correctButton]}
          >
            Correct
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAnswer(false)}
            style={[styles.button, styles.incorrectButton]}
          >
            Incorrect
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  progress: {
    width: '100%',
    marginBottom: 8,
  },
  counter: {
    marginBottom: 16,
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 3/2,
    marginVertical: 16,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  correctButton: {
    backgroundColor: '#4caf50',
  },
  incorrectButton: {
    backgroundColor: '#f44336',
  },
  message: {
    textAlign: 'center',
    marginVertical: 16,
  },
}); 