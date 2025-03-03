import { useState, useEffect } from 'react';
import type { FeedbackEntry, QuestionSet, FeedbackFlag } from '../types';
import { readJSONLFile, updateEntry } from '../utils/fileHandler';

export function useQuestions() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [questionSet, setQuestionSet] = useState<QuestionSet>({ currentSet: 1 });
  const [maxSetChecked, setMaxSetChecked] = useState<number>(1);

  useEffect(() => {
    loadQuestions();
  }, [questionSet.currentSet]);

  // Function to find the first unanswered set
  const findFirstUnansweredSet = async (startSet: number): Promise<number> => {
    let currentSetToCheck = startSet;
    let maxSetFound = startSet;
    
    try {
      while (true) {
        console.log(`Checking set ${currentSetToCheck} for unanswered questions...`);
        
        // Try to load this set
        try {
          const setEntries = await readJSONLFile(`data/set_${currentSetToCheck}.jsonl`);
          
          // If we successfully loaded this set, update maxSetFound
          maxSetFound = Math.max(maxSetFound, currentSetToCheck);
          
          // Check if this set has any unanswered questions
          // Important: Only count completely unanswered questions (flag === null)
          // Skip questions marked with flag === 3
          const hasUnansweredQuestions = setEntries.some(entry => entry.flag === null);
          
          if (hasUnansweredQuestions) {
            // Found a set with unanswered questions
            console.log(`Set ${currentSetToCheck} has unanswered questions`);
            return currentSetToCheck;
          }
          
          // No unanswered questions in this set, try the next one
          currentSetToCheck++;
        } catch (error) {
          // If we can't load the file, we've likely reached the end of available sets
          console.log(`Reached the end of available sets at set ${currentSetToCheck-1}`);
          break;
        }
      }
      
      // If we've checked all sets and they're all answered, return the max set found + 1
      // This creates a new set when all existing ones are complete
      return maxSetFound + 1;
    } catch (error) {
      console.error('Error finding unanswered set:', error);
      return startSet; // Fall back to the starting set on error
    }
  };

  const loadQuestions = async () => {
    try {
      console.log('Loading questions from set', questionSet.currentSet);
      const loadedEntries = await readJSONLFile(`data/set_${questionSet.currentSet}.jsonl`);
      console.log('Loaded entries:', loadedEntries);
      setEntries(loadedEntries);
      
      // Find the first unanswered question (ignoring skipped ones which have flag === 3)
      const firstUnansweredIndex = loadedEntries.findIndex(entry => entry.flag === null);
      console.log('First unanswered index:', firstUnansweredIndex);
      
      if (firstUnansweredIndex >= 0) {
        setCurrentIndex(firstUnansweredIndex);
      } else {
        // If all questions in this set have been answered or skipped,
        // we'll show the complete page by setting index to 0
        setCurrentIndex(0);
      }
      
      // Track the highest set number we've found
      setMaxSetChecked(Math.max(maxSetChecked, questionSet.currentSet));
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

      // Reload questions to find the next unanswered one in this set
      // This will automatically show the complete page if all are answered
      await loadQuestions();
    } catch (error) {
      console.error('Error handling choice:', error);
    }
  };

  const skipRemainingQuestions = async () => {
    try {
      // Get all remaining unanswered questions
      const remainingQuestions = entries.reduce((acc: number[], entry, index) => {
        if (entry.flag === null) {
          acc.push(index);
        }
        return acc;
      }, []);

      // Update all remaining questions with flag 3 (skipped) in the file
      for (const index of remainingQuestions) {
        await updateEntry(`data/set_${questionSet.currentSet}.jsonl`, index, { flag: 3 });
      }

      // This will show the complete page since all questions are now answered or skipped
      await loadQuestions();
    } catch (error) {
      console.error('Error skipping remaining questions:', error);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark current question as skipped (flag = 3) in the file
      await updateEntry(`data/set_${questionSet.currentSet}.jsonl`, currentIndex, { flag: 3 });
      console.log(`Marked question ${currentIndex} as skipped in the file`);
      
      // Find next unanswered question
      const nextIndex = findNextQuestion(currentIndex);
      
      if (nextIndex === currentIndex) {
        // If we couldn't find another unanswered question, reload
        // This will trigger the isComplete check
        await loadQuestions();
      } else {
        setCurrentIndex(nextIndex);
      }
    } catch (error) {
      console.error('Error handling skip:', error);
    }
  };

  const findNextQuestion = (currentIdx: number): number => {
    // First try to find the next unanswered question after current index
    for (let i = currentIdx + 1; i < entries.length; i++) {
      if (entries[i].flag === null) {
        return i;
      }
    }
    
    // If not found, look from the beginning
    for (let i = 0; i < currentIdx; i++) {
      if (entries[i].flag === null) {
        return i;
      }
    }
    
    // If no unanswered questions remain, stay on current
    return currentIdx;
  };

  const loadNextSet = async () => {
    setLoading(true);
    
    // Find the first unanswered set starting from the next one
    const nextUnansweredSet = await findFirstUnansweredSet(questionSet.currentSet + 1);
    
    // Load the next unanswered set
    setQuestionSet({ currentSet: nextUnansweredSet });
  };

  // Check if all questions have been answered or skipped
  const isComplete = entries.every(entry => entry.flag !== null);

  // Check if any questions are skipped (flag = 3)
  const hasSkippedQuestions = entries.some(entry => entry.flag === 3);

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
    isComplete,
    skipRemainingQuestions
  };
}