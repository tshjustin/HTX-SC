import { useState, useEffect } from 'react';
import type { FeedbackEntry } from '../types';
import { readJSONLFile, updateEntry } from '../utils/fileHandler';

const JSONL_PATH = '/data/questions.jsonl';

export function useQuestions() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const loadedEntries = await readJSONLFile(JSONL_PATH);
      setEntries(loadedEntries);
      
      // Find the first unanswered question
      const firstUnansweredIndex = loadedEntries.findIndex(entry => entry.flag === null);
      if (firstUnansweredIndex === -1) {
        // If all questions are answered, show a message or handle accordingly
        console.log('All questions have been answered');
      }
      setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  const handleChoice = async (flag: 0 | 1 | 2, feedback: string | null = null) => {
    try {
      const updates: Partial<FeedbackEntry> = { flag };
      if (feedback) {
        updates.Feedback = feedback;
      }

      await updateEntry(JSONL_PATH, currentIndex, updates);

      // Update local state
      setEntries(current =>
        current.map((entry, idx) =>
          idx === currentIndex ? { ...entry, ...updates } : entry
        )
      );

      // Find next unanswered question
      const remainingUnanswered = entries
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => entry.flag === null && index !== currentIndex)
        .map(({ index }) => index);

      if (remainingUnanswered.length > 0) {
        // Randomly select from remaining unanswered questions
        const randomIndex = Math.floor(Math.random() * remainingUnanswered.length);
        setCurrentIndex(remainingUnanswered[randomIndex]);
      } else {
        // All questions have been answered
        console.log('All questions have been answered');
        // You might want to show a completion message or handle this case differently
      }
    } catch (error) {
      console.error('Error handling choice:', error);
    }
  };

  return {
    entries,
    currentEntry: entries[currentIndex],
    loading,
    handleChoice,
    isComplete: entries.every(entry => entry.flag !== null),
  };
}