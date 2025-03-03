import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mic, MicOff, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SpeechFeedbackProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const SpeechFeedback = ({ feedback, setFeedback, onSubmit, onCancel }: SpeechFeedbackProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Check secure context (HTTPS / localhost)
    const isSecureContext = window.isSecureContext || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';

    if (typeof window !== 'undefined' && isSecureContext) {
      try {
        const SpeechRecognition = window.webkitSpeechRecognition || 
                                 (window as any).SpeechRecognition;
        
        if (!SpeechRecognition) {
          console.error('Speech Recognition API not found');
          return;
        }

        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        let lastSpeechTime = Date.now();
        let pauseTimeout: NodeJS.Timeout | null = null;

        const checkSpeechPause = () => {
          const now = Date.now();
          if (now - lastSpeechTime >= 700) {  // 0.7 second pause - Change this for User Experience 
            recognitionInstance.stop();
          } else {
            pauseTimeout = setTimeout(checkSpeechPause, 100);  // Check every 100ms
          }
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          lastSpeechTime = Date.now();
          
          if (!pauseTimeout) {
            pauseTimeout = setTimeout(checkSpeechPause, 700);
          }

          let interimTranscript = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText = transcript;
              setFeedback(prev => {
                const newFeedback = `${prev} ${transcript}`.trim();
                return newFeedback;
              });
            } else {
              interimTranscript += transcript;
            }
          }

          setCurrentTranscript(interimTranscript);
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          setCurrentTranscript('');
          if (pauseTimeout) {
            clearTimeout(pauseTimeout);
            pauseTimeout = null;
          }
        };

        setRecognition(recognitionInstance);
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    }

    // Add keyboard listeners for arrow keys, 'UPARROW' and 'c' keys
    const handleKeyPress = (event: KeyboardEvent) => {
      // Left arrow for submit
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onSubmit();
      }
      // Right arrow for cancel
      else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onCancel();
      }
      //  'UPARROW' key for toggle recording
      else if (event.key === 'ArrowUp' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        toggleListening();
      }
      //  'c' key for clear
      else if (event.key.toLowerCase() === 'c' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setFeedback('');
        setCurrentTranscript('');
        if (isListening) {
          recognition?.stop();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [setFeedback, isListening, recognition, onSubmit, onCancel]);

  const toggleListening = () => {
    if (!recognition) {
      console.error('No speech recognition instance available');
      alert('Must run on localhost or HTTPS');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setCurrentTranscript('');
    } else {
      recognition.abort();
      recognition.start();
      setIsListening(true);
    }
  };

  const handleClear = () => {
    setFeedback('');
    setCurrentTranscript('');
    if (isListening) {
      recognition?.stop();
    }
  };

  // prevents input keys of recording to be typed in the input box 
  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.key === 'ArrowUp' || event.key.toLowerCase() === 'c') && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
    // Prevent empty feedback on submission
    if (event.key === 'ArrowLeft' && !feedback.trim()) {
      event.preventDefault();
    }
  };

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6 mt-8 pt-4 border-t border-gray-200">
      <div className="flex items-start gap-3">
        <MessageSquare className="w-8 h-8 text-purple-600 mt-2" />
        <div className="flex-1 space-y-4">
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Please provide your feedback...&#10;&#10;For voice, press V once to record. Feedback is recorded after pausing."             
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
            />
            {currentTranscript && (
              <div className="absolute bottom-0 left-0 right-0 p-4 text-lg text-gray-500 italic">
                {currentTranscript}...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Recording in Progress
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Press ↑ to Start Recording
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200"
            >
              <Trash2 className="w-5 h-5" />
              Press C to Clear
            </button>
            {isListening && (
              <span className="text-sm text-gray-600 animate-pulse">
                Listening... 
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <button onClick={handleSubmit}
                disabled={!feedback.trim()}
                className={`flex items-center gap-3 px-12 py-6 text-xl rounded-lg transform transition-all duration-300 
                  ${feedback.trim() 
                    ? 'bg-purple-600 hover:bg-purple-700 hover:scale-110 hover:shadow-lg text-white' 
                    : 'bg-purple-300 cursor-not-allowed text-white/80'}`}
        >

        <ChevronLeft className="w-6 h-6" />
        Submit Feedback
        <span className="text-sm">(← Left Arrow)</span>
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-3 px-12 py-6 text-xl bg-gray-500 text-white rounded-lg transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-gray-600"
        >
          Cancel
          <span className="text-sm">(→ Right Arrow)</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SpeechFeedback;