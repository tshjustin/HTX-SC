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
      setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  const handleChoice = async (flag: 0 | 1 | 2, feedback: string | null = null) => {
    try {
      const updates: Partial<FeedbackEntry> = { 
        flag,
        Feedback: feedback 
      };

      // Update the JSONL file
      await updateEntry(JSONL_PATH, currentIndex, updates);

      // Reload questions to get fresh data
      await loadQuestions();
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