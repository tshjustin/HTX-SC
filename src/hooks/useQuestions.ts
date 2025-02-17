import { useState, useEffect } from 'react';
import type { FeedbackEntry, QuestionSet, FeedbackFlag } from '../types';
import { readJSONLFile, updateEntry } from '../utils/fileHandler';

export function useQuestions() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
  const [questionSet, setQuestionSet] = useState<QuestionSet>({ currentSet: 1 });

  useEffect(() => {
    loadQuestions();
  }, [questionSet.currentSet]);

  const loadQuestions = async () => {
    try {
      console.log('Loading questions from set', questionSet.currentSet);
      const loadedEntries = await readJSONLFile(`data/set_${questionSet.currentSet}.jsonl`);
      console.log('Loaded entries:', loadedEntries);
      setEntries(loadedEntries);
      
      // Find the first unanswered and non-skipped question
      const firstUnansweredIndex = loadedEntries.findIndex(
        (entry, index) => entry.flag === null && !skippedQuestions.has(index)
      );
      console.log('First unanswered index:', firstUnansweredIndex);
      setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  const handleChoice = async (flag: FeedbackFlag, feedback: string | null = null) => {
    try {
      console.log('Handling choice:', { flag, feedback, currentIndex });
      const updates: Partial<FeedbackEntry> = { 
        flag,
        Feedback: feedback 
      };

      // Update the JSONL file
      await updateEntry(`data/set_${questionSet.currentSet}.jsonl`, currentIndex, updates);
      console.log('Successfully updated entry');

      // Remove from skipped questions if it was skipped
      if (skippedQuestions.has(currentIndex)) {
        const newSkipped = new Set(skippedQuestions);
        newSkipped.delete(currentIndex);
        setSkippedQuestions(newSkipped);
      }

      // Reload questions to get the updated state
      await loadQuestions();
    } catch (error) {
      console.error('Error handling choice:', error);
    }
  };

  const handleSkip = () => {
    // Add current question to skipped set
    const newSkipped = new Set(skippedQuestions);
    newSkipped.add(currentIndex);
    setSkippedQuestions(newSkipped);

    // Find next non-skipped question
    const nextIndex = findNextQuestion(currentIndex);
    setCurrentIndex(nextIndex);
  };

  const findNextQuestion = (currentIdx: number): number => {
    // First try to find the next unanswered, non-skipped question after current index
    for (let i = currentIdx + 1; i < entries.length; i++) {
      if (entries[i].flag === null && !skippedQuestions.has(i)) {
        return i;
      }
    }
    
    // If not found, look from the beginning
    for (let i = 0; i < currentIdx; i++) {
      if (entries[i].flag === null && !skippedQuestions.has(i)) {
        return i;
      }
    }
    
    // If no unanswered non-skipped questions remain, show first skipped question
    const firstSkipped = Array.from(skippedQuestions)[0];
    if (firstSkipped !== undefined) {
      return firstSkipped;
    }
    
    // If no questions available, stay on current
    return currentIdx;
  };

  const loadNextSet = () => {
    setLoading(true);
    setSkippedQuestions(new Set());
    setQuestionSet(prev => ({ ...prev, currentSet: prev.currentSet + 1 }));
  };

  const isComplete = entries.every((entry, index) => 
    entry.flag !== null || skippedQuestions.has(index)
  );

  const hasSkippedQuestions = skippedQuestions.size > 0;

  return {
    currentEntry: entries[currentIndex],
    currentIndex,
    totalQuestions: entries.length,
    loading,
    handleChoice,
    handleSkip,
    hasSkippedQuestions,
    loadNextSet,
    currentSet: questionSet.currentSet,
    isComplete
  };
}