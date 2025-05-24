import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'ReviewSummary'>;

export default function ReviewSummaryScreen({ route, navigation }: Props) {
  const { totalCards, correctCards, accuracy, sessionId } = route.params;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Review Complete! 🎉
      </Text>

      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statRow}>
            <Text variant="titleMedium">Total Cards</Text>
            <Text variant="headlineSmall">{totalCards}</Text>
          </View>
          <View style={styles.statRow}>
            <Text variant="titleMedium">Correct Answers</Text>
            <Text variant="headlineSmall">{correctCards}</Text>
          </View>
          <View style={styles.statRow}>
            <Text variant="titleMedium">Accuracy</Text>
            <Text variant="headlineSmall">{accuracy.toFixed(1)}%</Text>
          </View>
        </Card.Content>
      </Card>

      <Text variant="bodyLarge" style={styles.message}>
        {accuracy >= 80
          ? "Great job! Keep up the good work! 🌟"
          : accuracy >= 60
          ? "Good effort! Keep practicing to improve! 💪"
          : "Don't worry! Practice makes perfect! 📚"}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('DailyReview')}
          style={styles.button}
        >
          Start New Review
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          Back to Home
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
  },
  statsCard: {
    width: '100%',
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginVertical: 8,
  },
}); 