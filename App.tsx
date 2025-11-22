import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TopicSelector from './components/TopicSelector';
import StudyContent from './components/StudyContent';
import QuizModal from './components/QuizModal';
import { ViewState, StudyGuide, QuizSession } from './types';
import { generateMedicalContent, generateQuizQuestions } from './services/gemini';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState<StudyGuide | null>(null);
  const [quizData, setQuizData] = useState<QuizSession | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const handleSelectTopic = useCallback(async (topic: string) => {
    setIsLoading(true);
    try {
      const data = await generateMedicalContent(topic);
      setStudyData(data);
      setViewState(ViewState.STUDY);
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("Failed to generate study guide. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartQuiz = useCallback(async () => {
    if (!studyData) return;
    setViewState(ViewState.QUIZ);
    
    // Only fetch if we haven't already for this session to save tokens/time
    // Or fetch fresh every time? Let's fetch fresh to be dynamic.
    setQuizLoading(true);
    try {
      const data = await generateQuizQuestions(studyData.topic);
      setQuizData(data);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      setViewState(ViewState.STUDY);
      alert("Could not generate quiz at this time.");
    } finally {
      setQuizLoading(false);
    }
  }, [studyData]);

  const handleCloseQuiz = () => {
    setViewState(ViewState.STUDY);
    setQuizData(null); // clear quiz data so next time we get fresh questions
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header onHome={() => setViewState(ViewState.HOME)} />

      <main>
        {viewState === ViewState.HOME && (
          <TopicSelector onSelectTopic={handleSelectTopic} isLoading={isLoading} />
        )}

        {viewState === ViewState.STUDY && studyData && (
          <StudyContent 
            data={studyData} 
            onStartQuiz={handleStartQuiz} 
          />
        )}

        {viewState === ViewState.QUIZ && (
          <>
            {/* Render StudyContent in background but dimmed? Or just swap views? 
                Let's keep StudyContent visible and overlay the modal. 
                However, for React structure simplicity in this prompt format, 
                I'll render StudyContent and the Modal on top.
            */}
            {studyData && <StudyContent data={studyData} onStartQuiz={() => {}} />}
            <QuizModal 
              quizData={quizData} 
              isLoading={quizLoading} 
              onClose={handleCloseQuiz} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;