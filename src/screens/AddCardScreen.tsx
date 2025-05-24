import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { RootStackScreenProps } from '../navigation/types';
import { getDecks, saveDeck } from '../utils/storage';

type Props = RootStackScreenProps<'AddCard'>;

export default function AddCardScreen({ route, navigation }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { deckId } = route.params;

  const handleAddCard = async () => {
    if (!question.trim() || !answer.trim()) return;

    const decks = await getDecks();
    const deck = decks.find(d => d.id === deckId);
    
    if (!deck) return;

    const newCard = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: answer.trim(),
      createdAt: Date.now(),
    };

    deck.cards.push(newCard);
    await saveDeck(deck);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Question"
        value={question}
        onChangeText={setQuestion}
        style={styles.input}
        multiline
        autoFocus
      />
      <TextInput
        label="Answer"
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
        multiline
      />
      <Button
        mode="contained"
        onPress={handleAddCard}
        style={styles.button}
        disabled={!question.trim() || !answer.trim()}
      >
        Add Card
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 