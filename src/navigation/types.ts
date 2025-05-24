import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  DeckDetail: { deckId: string };
  AddDeck: undefined;
  AddCard: { deckId: string };
  Quiz: { deckId: string };
  ImportDeck: undefined;
  Settings: undefined;
  DailyReview: undefined;
  ReviewSummary: {
    totalCards: number;
    correctCards: number;
    accuracy: number;
    sessionId: string;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 