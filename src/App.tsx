import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, XCircle, SkipForward, Forward, FastForward } from 'lucide-react';
import type { FeedbackFlag } from './types';
import { useQuestions } from './hooks/useQuestions';
import SpeechFeedback from './components/SpeechFeedback';

function App() {
  const { 
    currentEntry, 
    loading, 
    handleChoice, 
    handleSkip,
    skipRemainingQuestions, 
    hasSkippedQuestions, 
    isComplete,
    loadNextSet,
    currentSet,
    currentIndex,
    totalQuestions
  } = useQuestions();
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Keyboard event listener 
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts if not showing feedback form
      if (!showFeedback) {
        const triggerButtonAnimation = (buttonId: string) => {
          const button = document.getElementById(buttonId);
          if (button) {
            button.classList.add('animate-buttonPress');
            setTimeout(() => {
              button.classList.remove('animate-buttonPress');
            }, 200);
          }
        };

        switch (event.key.toLowerCase()) {
          case 'arrowleft':
            triggerButtonAnimation('response1-btn');
            onChoice(0);
            break;
          case 'arrowright':
            triggerButtonAnimation('response2-btn');
            onChoice(1);
            break;
          case 'arrowup':
            onChoice(2);
            break;
          case 'arrowdown':
            handleSkip();
            break;
          case 'p':
            if (!event.ctrlKey && !event.metaKey) {
              skipRemainingQuestions();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFeedback, handleChoice, handleSkip, skipRemainingQuestions]); 

  const onChoice = (flag: FeedbackFlag) => {
    if (flag === 2) {
      setShowFeedback(true);
    } else {
      handleChoice(flag);
      setShowFeedback(false);
    }
  };

  const submitFeedback = () => {
    handleChoice(2, feedback);
    setShowFeedback(false);
    setFeedback('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading questions...</div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Set {currentSet} Complete!</h2>
          <p className="text-gray-700 mb-8">You have completed all questions in this set.</p>
          <button
            onClick={loadNextSet}
            className="flex items-center gap-2 px-8 py-4 text-xl bg-purple-600 text-white rounded-lg mx-auto transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-purple-700"
          >
            <Forward className="w-6 h-6" />
            Load Next Question Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-500">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="flex-1 bg-gray-100 rounded-xl shadow-2xl p-8 flex flex-col justify-between">
          <div className="flex flex-col flex-1">
            <div className="mb-8">
              <div className="flex items-start">
                <img 
                  src="/assets/htx-logo.png" 
                  alt="HTX Logo" 
                  className="h-20 object-contain"
                />
                <div className="ml-auto text-lg font-semibold text-purple-800">
                  Set {currentSet} ({Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions})
                </div>
              </div>
              <div className="flex flex-col items-center -mt-16">
                <h1 className="text-4xl font-bold text-purple-800 mb-4">
                  Help us Train our AI Model! 
                </h1>
                <div className="h-1 w-[70%] bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 bg-300% animate-gradient rounded-full"></div>
              </div>
            </div>

            <div 
              key={currentIndex}
              className="animate-fadeIn flex flex-col flex-1"
            >
              <div className="mb-4">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                  Instruction:
                </h2>
                <p className="text-2xl text-gray-700 bg-purple-50 p-6 rounded-lg">
                  {currentEntry?.['instruction']}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 mb-8">
                <div className="bg-blue-50 p-8 rounded-lg flex flex-col min-h-[400px]">
                  <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    Response 1 
                    <span className="text-sm text-gray-500">(← Left Arrow)</span>
                  </h3>
                  <p className="text-2xl leading-loose text-gray-700 flex-grow overflow-y-auto">
                    {currentEntry?.['output-o1']}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-8 rounded-lg flex flex-col min-h-[400px]">
                  <h3 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    Response 2
                    <span className="text-sm text-gray-500">(→ Right Arrow)</span>
                  </h3>
                  <p className="text-2xl leading-loose text-gray-700 flex-grow overflow-y-auto">
                    {currentEntry?.['output-qwen']}
                  </p>
                </div>
              </div>
            </div>
          
            {!showFeedback ? (
              <div className="mt-auto border-t border-gray-200">
                <div className="flex justify-between gap-4 p-4">
                  <button
                    id="response1-btn"
                    onClick={() => onChoice(0)}
                    className="flex-1 flex items-center justify-center gap-3 px-12 py-8 text-2xl bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:animate-buttonPress focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ChevronLeft className="w-10 h-10" />
                    Choose Response 1
                  </button>
                  
                  <button
                    onClick={() => onChoice(2)}
                    className="flex-1 flex items-center justify-center gap-3 px-12 py-8 text-2xl bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:animate-buttonPress focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    title="Press ↑ Up Arrow"
                  >
                    <XCircle className="w-10 h-10" />
                    Neither
                    <span className="text-sm ml-2">(↑ Up Arrow)</span>
                  </button>
                  
                  <button
                    id="response2-btn"
                    onClick={() => onChoice(1)}
                    className="flex-1 flex items-center justify-center gap-3 px-12 py-8 text-2xl bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:animate-buttonPress focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Choose Response 2
                    <ChevronRight className="w-10 h-10" />
                  </button>
                </div>
                
                <div className="relative pb-4">
                  {/* Main skip button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSkip}
                      className="flex items-center gap-2 px-8 py-4 text-xl text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      title="Press ↓ Down Arrow"
                    >
                      <SkipForward className="w-6 h-6" />
                      Skip Question 
                      <span className="text-sm ml-2">(↓ Down Arrow)</span>
                    </button>
                  </div>
                  
                  {/* Skip to next set button - bottom right */}
                  <div className="absolute bottom-0 right-0">
                    <button
                      onClick={skipRemainingQuestions}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      title="Skip all remaining questions"
                    >
                      <FastForward className="w-4 h-4" />
                      Skip to Next Set
                      <span className="text-xs ml-1">(P)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <SpeechFeedback
                feedback={feedback}
                setFeedback={setFeedback}
                onSubmit={submitFeedback}
                onCancel={() => {
                  setShowFeedback(false);
                  setFeedback('');
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;