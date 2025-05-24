import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Card, Text, FAB } from 'react-native-paper';
import { RootStackScreenProps } from '../navigation/types';
import { Deck } from '../types';
import { getDecks, deleteDeck } from '../utils/storage';
import { getDueCards } from '../utils/spacedRepetition';

type Props = RootStackScreenProps<'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [dueCardCount, setDueCardCount] = useState(0);

  useEffect(() => {
    const loadDecks = async () => {
      const loadedDecks = await getDecks();
      setDecks(loadedDecks);
      
      // Calculate total due cards
      const totalDueCards = loadedDecks.reduce((total, deck) => {
        return total + getDueCards(deck).length;
      }, 0);
      setDueCardCount(totalDueCards);
    };

    const unsubscribe = navigation.addListener('focus', loadDecks);
    return unsubscribe;
  }, [navigation]);

  const handleDeleteDeck = async (deckId: string) => {
    await deleteDeck(deckId);
    setDecks(decks.filter(deck => deck.id !== deckId));
  };

  const renderDeckItem = ({ item: deck }: { item: Deck }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
    >
      <Card.Content>
        <Text variant="titleLarge">{deck.title}</Text>
        <Text variant="bodyMedium">{deck.cards.length} cards</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('Quiz', { deckId: deck.id })}>
          Start Quiz
        </Button>
        <Button onPress={() => handleDeleteDeck(deck.id)}>Delete</Button>
      </Card.Actions>
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall">No Flashcard Decks</Text>
      <Text variant="bodyMedium" style={styles.emptyStateText}>
        Create a new deck or import one to get started!
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('ImportDeck')}
        style={styles.importButton}
      >
        Import from Quizlet
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {dueCardCount > 0 && (
        <Card style={styles.reviewCard}>
          <Card.Content>
            <Text variant="titleMedium">
              {dueCardCount} card{dueCardCount !== 1 ? 's' : ''} due for review
            </Text>
            <Text variant="bodyMedium">
              Keep your knowledge fresh with daily reviews!
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DailyReview')}
            >
              Start Daily Review
            </Button>
          </Card.Actions>
        </Card>
      )}

      <FlatList
        data={decks}
        renderItem={renderDeckItem}
        keyExtractor={deck => deck.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={EmptyState}
      />

      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={[styles.fab, styles.addFab]}
          onPress={() => navigation.navigate('AddDeck')}
        />
        <FAB
          icon="download"
          style={[styles.fab, styles.importFab]}
          onPress={() => navigation.navigate('ImportDeck')}
        />
        <FAB
          icon="calendar-check"
          style={[styles.fab, styles.reviewFab]}
          onPress={() => navigation.navigate('DailyReview')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  reviewCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#e3f2fd',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  importButton: {
    marginTop: 16,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    marginTop: 8,
  },
  addFab: {
    backgroundColor: '#2196f3',
  },
  importFab: {
    backgroundColor: '#4caf50',
  },
  reviewFab: {
    backgroundColor: '#ff9800',
  },
}); 