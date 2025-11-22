import React, { useState, useEffect } from 'react';
import { QuizSession } from '../types';
import { X, CheckCircle, XCircle, Trophy, ChevronRight, RefreshCw, SkipForward, AlertCircle, HelpCircle, ArrowLeft } from 'lucide-react';

interface QuizModalProps {
  quizData: QuizSession | null;
  isLoading: boolean;
  onClose: () => void;
}

type QuestionStatus = 'unanswered' | 'skipped' | 'correct' | 'incorrect';

interface QuestionState {
  status: QuestionStatus;
  selectedOption: number | null;
}

const QuizModal: React.FC<QuizModalProps> = ({ quizData, isLoading, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuestionState[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (quizData) {
      setQuizState(quizData.questions.map(() => ({
        status: 'unanswered',
        selectedOption: null
      })));
      setCurrentIndex(0);
      setShowResults(false);
    }
  }, [quizData]);

  if (!quizData && !isLoading) return null;

  const totalQuestions = quizData?.questions.length || 0;
  const currentQuestion = quizData?.questions[currentIndex];
  const currentState = quizState[currentIndex];

  // Derived stats
  const correctCount = quizState.filter(q => q.status === 'correct').length;
  const skippedCount = quizState.filter(q => q.status === 'skipped').length;
  const incorrectCount = quizState.filter(q => q.status === 'incorrect').length;
  const answeredCount = correctCount + incorrectCount;

  const handleOptionClick = (index: number) => {
    // Prevent changing answer if already graded
    if (currentState?.status === 'correct' || currentState?.status === 'incorrect') return;

    setQuizState(prev => {
      const newState = [...prev];
      newState[currentIndex] = {
        ...newState[currentIndex],
        selectedOption: index,
        // If it was skipped, selecting an option essentially prepares it to be answered, 
        // but we keep it as 'skipped' or 'unanswered' until they check. 
        // Let's reset to 'unanswered' so it loses the yellow "skipped" status visually immediately?
        // No, let's keep it until they decide.
      };
      return newState;
    });
  };

  const handleCheckAnswer = () => {
    if (currentState?.selectedOption === null || !currentQuestion) return;

    const isCorrect = currentState.selectedOption === currentQuestion.correctAnswer;
    
    setQuizState(prev => {
      const newState = [...prev];
      newState[currentIndex] = {
        ...newState[currentIndex],
        status: isCorrect ? 'correct' : 'incorrect'
      };
      return newState;
    });
  };

  const handleSkip = () => {
    setQuizState(prev => {
      const newState = [...prev];
      newState[currentIndex] = {
        ...newState[currentIndex],
        status: 'skipped',
        selectedOption: null // Optional: clear selection if they skip
      };
      return newState;
    });
    
    // Auto-advance if not last
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Logic for "Finish" or "Review"
      if (skippedCount > 0) {
        // Find first skipped index
        const firstSkipped = quizState.findIndex(q => q.status === 'skipped');
        if (firstSkipped !== -1) setCurrentIndex(firstSkipped);
      } else {
        setShowResults(true);
      }
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  // Styles helpers
  const getOptionStyle = (index: number) => {
    const isGraded = currentState?.status === 'correct' || currentState?.status === 'incorrect';
    const isSelected = currentState?.selectedOption === index;
    const isCorrectOption = index === currentQuestion?.correctAnswer;

    const baseStyle = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between ";
    
    if (!isGraded) {
      if (isSelected) return baseStyle + "border-teal-500 bg-teal-50 text-teal-900";
      return baseStyle + "border-slate-200 hover:border-teal-200 hover:bg-slate-50 text-slate-700";
    }

    // Graded state
    if (isCorrectOption) {
      return baseStyle + "border-green-500 bg-green-50 text-green-900 font-medium";
    }
    if (isSelected && !isCorrectOption) {
      return baseStyle + "border-red-300 bg-red-50 text-red-900";
    }
    return baseStyle + "border-slate-100 text-slate-400 opacity-60";
  };

  const getNavIndicatorStyle = (index: number, status: QuestionStatus) => {
    const isActive = index === currentIndex;
    let base = "w-3 h-3 rounded-full transition-all duration-300 ";
    
    if (isActive) base += " ring-2 ring-offset-2 ring-slate-400 scale-125 ";
    
    switch (status) {
      case 'correct': return base + "bg-green-500";
      case 'incorrect': return base + "bg-red-500";
      case 'skipped': return base + "bg-amber-400";
      default: return base + "bg-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Navigation */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse" />
              Knowledge Check
            </h3>
            <div className="flex items-center space-x-2">
               {/* Legend for small screens? Maybe skip to keep clean */}
               <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>
          
          {/* Progress Navigator */}
          {!isLoading && !showResults && (
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {quizState.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToQuestion(idx)}
                  className={getNavIndicatorStyle(idx, q.status)}
                  title={`Question ${idx + 1}: ${q.status}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Generating clinical vignettes...</p>
            </div>
          ) : showResults ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-teal-100 rounded-full mb-6">
                <Trophy className="w-12 h-12 text-teal-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
              
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto my-8">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-xs text-green-800 font-medium uppercase">Correct</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                  <div className="text-xs text-red-800 font-medium uppercase">Incorrect</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="text-2xl font-bold text-amber-600">{skippedCount}</div>
                  <div className="text-xs text-amber-800 font-medium uppercase">Skipped</div>
                </div>
              </div>

              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {correctCount === totalQuestions ? "Perfect score! You've mastered this topic." : 
                 correctCount > totalQuestions / 2 ? "Great job! Review the explanations to solidify your knowledge." :
                 "Keep studying! Review the clinical anatomy sections and try again."}
              </p>

              <button 
                onClick={onClose}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Return to Study Mode
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Question Header */}
              <div className="flex justify-between items-start">
                 <div>
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-1 rounded-md">
                      Question {currentIndex + 1}
                    </span>
                    {currentState?.status === 'skipped' && (
                      <span className="ml-2 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md flex inline-flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Skipped
                      </span>
                    )}
                 </div>
              </div>

              {/* Question Text */}
              <p className="text-xl font-medium text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    className={getOptionStyle(idx)}
                    disabled={currentState?.status === 'correct' || currentState?.status === 'incorrect'}
                  >
                    <span>{option}</span>
                    {(currentState?.status === 'correct' || currentState?.status === 'incorrect') && idx === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                    )}
                    {(currentState?.status === 'incorrect') && currentState.selectedOption === idx && idx !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {(currentState?.status === 'correct' || currentState?.status === 'incorrect') && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center mb-2 text-blue-700 font-bold">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Clinical Explanation
                  </div>
                  {currentQuestion.explanation}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!isLoading && !showResults && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
             {/* Left Action: Skip or Back */}
             <div className="flex-1">
               {(currentState?.status === 'unanswered' || currentState?.status === 'skipped') && (
                 <button
                   onClick={handleSkip}
                   className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center"
                 >
                   <SkipForward className="w-4 h-4 mr-2" />
                   Skip for now
                 </button>
               )}
               {(currentState?.status === 'correct' || currentState?.status === 'incorrect') && currentIndex > 0 && (
                  <button
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
               )}
             </div>

             {/* Right Action: Check or Next */}
             <div className="flex-1 flex justify-end">
                {currentState?.status === 'correct' || currentState?.status === 'incorrect' ? (
                   <button
                     onClick={handleNext}
                     className={`px-8 py-3 rounded-xl font-medium flex items-center shadow-md transition-all ${
                       currentIndex === totalQuestions - 1 && skippedCount > 0
                        ? "bg-amber-500 hover:bg-amber-600 text-white" 
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                     }`}
                   >
                     {currentIndex === totalQuestions - 1 
                       ? (skippedCount > 0 ? `Review ${skippedCount} Skipped` : 'Finish Quiz') 
                       : 'Next Question'}
                     <ChevronRight className="w-4 h-4 ml-2" />
                   </button>
                ) : (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={currentState?.selectedOption === null}
                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    Check Answer
                  </button>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;