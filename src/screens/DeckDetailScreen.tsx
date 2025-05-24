import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Card, Text, FAB } from 'react-native-paper';
import { RootStackScreenProps } from '../navigation/types';
import { Deck, Flashcard } from '../types';
import { getDecks } from '../utils/storage';

type Props = RootStackScreenProps<'DeckDetail'>;

export default function DeckDetailScreen({ route, navigation }: Props) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const { deckId } = route.params;

  useEffect(() => {
    const loadDeck = async () => {
      const decks = await getDecks();
      const foundDeck = decks.find(d => d.id === deckId);
      setDeck(foundDeck || null);
    };

    const unsubscribe = navigation.addListener('focus', loadDeck);
    return unsubscribe;
  }, [deckId, navigation]);

  const renderCardItem = ({ item: card }: { item: Flashcard }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Q: {card.question}</Text>
        <Text variant="bodyMedium">A: {card.answer}</Text>
      </Card.Content>
    </Card>
  );

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text>Deck not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{deck.title}</Text>
        <Text variant="bodyLarge">{deck.cards.length} cards</Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Quiz', { deckId })}
            disabled={deck.cards.length === 0}
            style={styles.button}
          >
            Start Quiz
          </Button>
        </View>
      </View>

      <FlatList
        data={deck.cards}
        renderItem={renderCardItem}
        keyExtractor={card => card.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddCard', { deckId })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 