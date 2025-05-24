import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { RootStackScreenProps } from '../navigation/types';
import { Deck } from '../types';
import { saveDeck } from '../utils/storage';

type Props = RootStackScreenProps<'AddDeck'>;

export default function AddDeckScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');

  const handleCreateDeck = async () => {
    if (!title.trim()) return;

    const newDeck: Deck = {
      id: Date.now().toString(),
      title: title.trim(),
      cards: [],
      createdAt: Date.now(),
    };

    await saveDeck(newDeck);
    navigation.navigate('DeckDetail', { deckId: newDeck.id });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Deck Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        autoFocus
      />
      <Button
        mode="contained"
        onPress={handleCreateDeck}
        style={styles.button}
        disabled={!title.trim()}
      >
        Create Deck
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