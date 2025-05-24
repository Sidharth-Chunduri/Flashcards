import React from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { List, Switch, Divider, Text, Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useSettings } from '../context/SettingsContext';
import { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'Settings'>;

export default function SettingsScreen() {
  const { settings, updateSettings, clearAllData, exportData, importData } = useSettings();

  const handleExport = async () => {
    try {
      const data = await exportData();
      await Share.share({
        message: data,
        title: 'Flashcards Backup'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json'
      });
      
      if (result.assets?.[0]) {
        const response = await fetch(result.assets[0].uri);
        const data = await response.text();
        await importData(data);
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          right={() => (
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => updateSettings({ darkMode: value })}
            />
          )}
        />
        <Divider />
        <List.Subheader>Study Preferences</List.Subheader>
        <List.Item
          title="Enable Spaced Repetition"
          description="Optimize review timing based on your performance"
          right={() => (
            <Switch
              value={settings.enableSpacedRepetition}
              onValueChange={(value) => updateSettings({ enableSpacedRepetition: value })}
            />
          )}
        />
        <List.Item
          title="Show Answer Timer"
          description="Display time spent on each card"
          right={() => (
            <Switch
              value={settings.showAnswerTimer}
              onValueChange={(value) => updateSettings({ showAnswerTimer: value })}
            />
          )}
        />
        <List.Item
          title="Enable Haptic Feedback"
          description="Vibrate on card actions"
          right={() => (
            <Switch
              value={settings.enableHapticFeedback}
              onValueChange={(value) => updateSettings({ enableHapticFeedback: value })}
            />
          )}
        />
        <Divider />
        <List.Subheader>Data Management</List.Subheader>
        <List.Item
          title="Export All Decks"
          description="Save your flashcards as JSON"
          onPress={handleExport}
          right={props => <List.Icon {...props} icon="download" />}
        />
        <List.Item
          title="Import Backup"
          description="Restore from a backup file"
          onPress={handleImport}
          right={props => <List.Icon {...props} icon="upload" />}
        />
        <List.Item
          title="Clear All Data"
          description="Delete all decks and settings"
          onPress={handleClearData}
          right={props => <List.Icon {...props} icon="delete" color="#f44336" />}
        />
      </List.Section>
      
      <View style={styles.versionContainer}>
        <Text variant="bodySmall">Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
}); 