import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, IconButton } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';

import HomeScreen from './src/screens/HomeScreen';
import DeckDetailScreen from './src/screens/DeckDetailScreen';
import AddDeckScreen from './src/screens/AddDeckScreen';
import AddCardScreen from './src/screens/AddCardScreen';
import QuizScreen from './src/screens/QuizScreen';
import ImportDeckScreen from './src/screens/ImportDeckScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DailyReviewScreen from './src/screens/DailyReviewScreen';
import ReviewSummaryScreen from './src/screens/ReviewSummaryScreen';
import { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { settings } = useSettings();
  const theme = settings.darkMode ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'Flashcards',
              headerRight: () => (
                <IconButton
                  icon="cog"
                  iconColor={theme.colors.onPrimary}
                  onPress={() => navigation.navigate('Settings')}
                />
              ),
            })}
          />
          <Stack.Screen
            name="DeckDetail"
            component={DeckDetailScreen}
            options={{ title: 'Deck Details' }}
          />
          <Stack.Screen
            name="AddDeck"
            component={AddDeckScreen}
            options={{ title: 'Create New Deck' }}
          />
          <Stack.Screen
            name="AddCard"
            component={AddCardScreen}
            options={{ title: 'Add New Card' }}
          />
          <Stack.Screen
            name="Quiz"
            component={QuizScreen}
            options={{ title: 'Quiz' }}
          />
          <Stack.Screen
            name="ImportDeck"
            component={ImportDeckScreen}
            options={{ title: 'Import Flashcards' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="DailyReview"
            component={DailyReviewScreen}
            options={{ title: 'Daily Review' }}
          />
          <Stack.Screen
            name="ReviewSummary"
            component={ReviewSummaryScreen}
            options={{ title: 'Review Complete', headerLeft: () => null }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
