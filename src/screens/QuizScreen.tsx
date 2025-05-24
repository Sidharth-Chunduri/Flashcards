import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Button, Card, Text, ProgressBar, Surface } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { RootStackScreenProps } from '../navigation/types';
import { Deck } from '../types';
import { getDecks } from '../utils/storage';
import { useSettings } from '../context/SettingsContext';

type Props = RootStackScreenProps<'Quiz'>;

const { width } = Dimensions.get('window');

export default function QuizScreen({ route, navigation }: Props) {
  const { settings } = useSettings();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const { deckId } = route.params;

  useEffect(() => {
    const loadDeck = async () => {
      const decks = await getDecks();
      const foundDeck = decks.find(d => d.id === deckId);
      setDeck(foundDeck || null);
    };
    loadDeck();
  }, [deckId]);

  useEffect(() => {
    if (settings.showAnswerTimer && !showAnswer) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [settings.showAnswerTimer, showAnswer]);

  const handleFlip = async () => {
    if (settings.enableHapticFeedback) {
      await Haptics.selectionAsync();
    }
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = async (correct: boolean) => {
    if (settings.enableHapticFeedback) {
      await Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );
    }

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    setCurrentCardIndex(prev => prev + 1);
    setShowAnswer(false);
    setTimer(0);
  };

  if (!deck || deck.cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No cards available</Text>
      </View>
    );
  }

  if (currentCardIndex >= deck.cards.length) {
    const score = (correctAnswers / deck.cards.length) * 100;
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium">Quiz Complete!</Text>
        <Text variant="titleLarge" style={styles.score}>
          Score: {score.toFixed(1)}%
        </Text>
        <Text variant="bodyLarge">
          {correctAnswers} out of {deck.cards.length} correct
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => {
              setCurrentCardIndex(0);
              setCorrectAnswers(0);
              setShowAnswer(false);
              setTimer(0);
            }}
            style={styles.button}
          >
            Restart Quiz
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Back to Deck
          </Button>
        </View>
      </View>
    );
  }

  const currentCard = deck.cards[currentCardIndex];
  const progress = currentCardIndex / deck.cards.length;

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} style={styles.progress} />
      <Text style={styles.counter}>
        Card {currentCardIndex + 1} of {deck.cards.length}
      </Text>

      {settings.showAnswerTimer && !showAnswer && (
        <Text style={styles.timer}>Time: {timer}s</Text>
      )}

      <Surface style={styles.cardContainer} elevation={2}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.cardText}>
              {showAnswer ? currentCard.answer : currentCard.question}
            </Text>
          </Card.Content>
        </Card>
      </Surface>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleFlip} 
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
  timer: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    width: width - 32,
    aspectRatio: 3/2,
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
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
  score: {
    marginVertical: 16,
  },
}); 