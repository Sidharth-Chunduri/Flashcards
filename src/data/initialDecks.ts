import { Deck } from '../types';

export const initialDecks: Deck[] = [
  {
    id: 'basic-math',
    title: 'Basic Math Facts',
    createdAt: Date.now(),
    cards: [
      {
        id: 'math-1',
        question: 'What is 7 x 8?',
        answer: '56',
        createdAt: Date.now(),
      },
      {
        id: 'math-2',
        question: 'What is the square root of 144?',
        answer: '12',
        createdAt: Date.now(),
      },
      {
        id: 'math-3',
        question: 'What is 15% of 200?',
        answer: '30',
        createdAt: Date.now(),
      },
    ],
  },
  {
    id: 'world-capitals',
    title: 'World Capitals',
    createdAt: Date.now(),
    cards: [
      {
        id: 'capital-1',
        question: 'What is the capital of Japan?',
        answer: 'Tokyo',
        createdAt: Date.now(),
      },
      {
        id: 'capital-2',
        question: 'What is the capital of Brazil?',
        answer: 'Brasília',
        createdAt: Date.now(),
      },
      {
        id: 'capital-3',
        question: 'What is the capital of France?',
        answer: 'Paris',
        createdAt: Date.now(),
      },
    ],
  },
  {
    id: 'common-phrases-spanish',
    title: 'Common Spanish Phrases',
    createdAt: Date.now(),
    cards: [
      {
        id: 'spanish-1',
        question: 'How do you say "Hello" in Spanish?',
        answer: 'Hola',
        createdAt: Date.now(),
      },
      {
        id: 'spanish-2',
        question: 'How do you say "Thank you" in Spanish?',
        answer: 'Gracias',
        createdAt: Date.now(),
      },
      {
        id: 'spanish-3',
        question: 'How do you say "Good morning" in Spanish?',
        answer: 'Buenos días',
        createdAt: Date.now(),
      },
    ],
  },
  {
    id: 'science-facts',
    title: 'Basic Science Facts',
    createdAt: Date.now(),
    cards: [
      {
        id: 'science-1',
        question: 'What is the closest planet to the Sun?',
        answer: 'Mercury',
        createdAt: Date.now(),
      },
      {
        id: 'science-2',
        question: 'What is the chemical symbol for Gold?',
        answer: 'Au',
        createdAt: Date.now(),
      },
      {
        id: 'science-3',
        question: 'What is the hardest natural substance on Earth?',
        answer: 'Diamond',
        createdAt: Date.now(),
      },
    ],
  },
]; 