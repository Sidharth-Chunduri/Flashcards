import { QuizletSet, QuizletTerm } from '../types';

/**
 * Parses text that was copied from Quizlet in various formats:
 * Format 1: "term TAB definition NEWLINE"
 * Format 2: "term - definition" (one per line)
 * Format 3: Comma separated values
 */
export async function parseQuizletText(text: string): Promise<QuizletSet> {
  try {
    console.log('Starting manual Quizlet import');
    
    // Remove any BOM or special characters
    text = text.replace(/^\ufeff/, '');
    
    // Split into lines and remove empty ones
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('No content found in the pasted text');
    }

    console.log(`Found ${lines.length} lines to process`);

    // Try different formats
    let terms: QuizletTerm[] = [];

    // Try tab-separated format first (most common when copying directly from Quizlet)
    if (text.includes('\t')) {
      console.log('Detected tab-separated format');
      terms = lines.map(line => {
        const [term, definition] = line.split('\t').map(s => s.trim());
        return { term, definition };
      });
    }
    // Try dash-separated format
    else if (text.includes(' - ')) {
      console.log('Detected dash-separated format');
      terms = lines.map(line => {
        const [term, definition] = line.split(' - ').map(s => s.trim());
        return { term, definition };
      });
    }
    // Try comma-separated format
    else if (text.includes(',')) {
      console.log('Detected comma-separated format');
      terms = lines.map(line => {
        const [term, definition] = line.split(',').map(s => s.trim());
        return { term, definition };
      });
    }
    // If no known format is detected, assume each line alternates between term and definition
    else {
      console.log('Using alternating lines format');
      terms = [];
      for (let i = 0; i < lines.length; i += 2) {
        if (i + 1 < lines.length) {
          terms.push({
            term: lines[i].trim(),
            definition: lines[i + 1].trim()
          });
        }
      }
    }

    // Filter out invalid terms
    terms = terms.filter(term => {
      if (!term.term || !term.definition) {
        console.warn('Skipping invalid term:', term);
        return false;
      }
      return true;
    });

    if (terms.length === 0) {
      throw new Error('No valid flashcard terms found in the text');
    }

    console.log(`Successfully processed ${terms.length} terms`);

    // Use first term as part of the title if no title is provided
    const title = `Imported Deck (${terms[0].term.slice(0, 20)}...)`;

    return {
      title,
      terms
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Import error:', {
        message: error.message,
        stack: error.stack
      });

      // Provide user-friendly error messages
      if (error.message.includes('No content found')) {
        throw new Error('Please paste some content first');
      } else if (error.message.includes('No valid flashcard')) {
        throw new Error('Could not find any valid flashcards in the text. Please check the format and try again.');
      }
    }
    
    throw new Error('Failed to import flashcards. Please check the format and try again.');
  }
} 