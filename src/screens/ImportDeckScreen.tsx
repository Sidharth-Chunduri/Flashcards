import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { RootStackScreenProps } from '../navigation/types';
import { Deck, QuizletSet } from '../types';
import { saveDeck } from '../utils/storage';
import { parseQuizletText } from '../utils/quizletImport';

type Props = RootStackScreenProps<'ImportDeck'>;

export default function ImportDeckScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<QuizletSet | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await parseQuizletText(text);
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import flashcards. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    const newDeck: Deck = {
      id: Date.now().toString(),
      title: preview.title,
      cards: preview.terms.map(term => ({
        id: Date.now().toString() + Math.random(),
        question: term.term,
        answer: term.definition,
        createdAt: Date.now(),
      })),
      createdAt: Date.now(),
    };

    await saveDeck(newDeck);
    navigation.navigate('DeckDetail', { deckId: newDeck.id });
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Import Flashcards from Quizlet
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Copy your flashcards from Quizlet and paste them here. Supported formats:
        {'\n\n'}
        1. Term [tab] Definition
        {'\n'}
        2. Term - Definition
        {'\n'}
        3. Term, Definition
        {'\n'}
        4. Terms and definitions on alternating lines
      </Text>
      <TextInput
        label="Paste Flashcards"
        value={text}
        onChangeText={setText}
        style={styles.input}
        placeholder="Paste your flashcards here..."
        multiline
        numberOfLines={6}
      />
      <Button
        mode="contained"
        onPress={handleImport}
        loading={loading}
        disabled={!text.trim() || loading}
        style={styles.button}
      >
        Import
      </Button>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {preview && (
        <View style={styles.preview}>
          <Text variant="titleMedium">Preview:</Text>
          <Text variant="titleSmall">{preview.title}</Text>
          <Text variant="bodyMedium">
            {preview.terms.length} flashcards found
          </Text>
          {preview.terms.slice(0, 3).map((term, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text variant="bodyMedium">Q: {term.term}</Text>
                <Text variant="bodyMedium">A: {term.definition}</Text>
              </Card.Content>
            </Card>
          ))}
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
          >
            Save Deck
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  preview: {
    marginTop: 24,
  },
  card: {
    marginVertical: 8,
  },
}); 