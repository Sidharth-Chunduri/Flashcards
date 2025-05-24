import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface Settings {
  darkMode: boolean;
  enableSpacedRepetition: boolean;
  showAnswerTimer: boolean;
  enableHapticFeedback: boolean;
  cardReviewLimit: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

const defaultSettings: Settings = {
  darkMode: false,
  enableSpacedRepetition: true,
  showAnswerTimer: false,
  enableHapticFeedback: true,
  cardReviewLimit: 20,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('@flashcards:settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Initialize with system color scheme preference
        setSettings({
          ...defaultSettings,
          darkMode: systemColorScheme === 'dark'
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('@flashcards:settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);

      if (newSettings.enableHapticFeedback !== undefined) {
        if (newSettings.enableHapticFeedback) {
          await Haptics.selectionAsync();
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const exportData = async () => {
    try {
      const decks = await AsyncStorage.getItem('@flashcards:decks');
      const settings = await AsyncStorage.getItem('@flashcards:settings');
      const exportData = {
        decks: decks ? JSON.parse(decks) : [],
        settings: settings ? JSON.parse(settings) : defaultSettings,
      };
      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  };

  const importData = async (data: string) => {
    try {
      const importedData = JSON.parse(data);
      if (importedData.decks) {
        await AsyncStorage.setItem('@flashcards:decks', JSON.stringify(importedData.decks));
      }
      if (importedData.settings) {
        await AsyncStorage.setItem('@flashcards:settings', JSON.stringify(importedData.settings));
        setSettings(importedData.settings);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      clearAllData,
      exportData,
      importData,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 