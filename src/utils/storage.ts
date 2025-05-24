import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck } from '../types';
import { initialDecks } from '../data/initialDecks';

const DECKS_STORAGE_KEY = '@flashcards:decks';
const FIRST_LAUNCH_KEY = '@flashcards:first_launch';

export const getDecks = async (): Promise<Deck[]> => {
  try {
    // Check if this is the first launch
    const isFirstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    if (!isFirstLaunch) {
      // If first launch, save initial decks
      await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(initialDecks));
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
      return initialDecks;
    }

    const decksJson = await AsyncStorage.getItem(DECKS_STORAGE_KEY);
    return decksJson ? JSON.parse(decksJson) : [];
  } catch (error) {
    console.error('Error loading decks:', error);
    return [];
  }
};

export const saveDeck = async (deck: Deck): Promise<void> => {
  try {
    const decks = await getDecks();
    const existingDeckIndex = decks.findIndex(d => d.id === deck.id);
    
    if (existingDeckIndex >= 0) {
      decks[existingDeckIndex] = deck;
    } else {
      decks.push(deck);
    }
    
    await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.error('Error saving deck:', error);
    throw error;
  }
};

export const deleteDeck = async (deckId: string): Promise<void> => {
  try {
    const decks = await getDecks();
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    await AsyncStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(updatedDecks));
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DECKS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}; 