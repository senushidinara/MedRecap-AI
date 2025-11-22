import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import TopicSelector from './components/TopicSelector';
import StudyContent from './components/StudyContent';
import QuizModal from './components/QuizModal';
import { ViewState, StudyGuide, QuizSession, UserStats, AppSettings } from './types';
import { generateMedicalContent, generateQuizQuestions } from './services/gemini';

const DEFAULT_STATS: UserStats = {
  points: 0,
  streakDays: 0,
  topicsMastered: 0,
  lastStudyDate: new Date().toISOString(),
  moodScore: undefined
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState<StudyGuide | null>(null);
  const [quizData, setQuizData] = useState<QuizSession | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy'|'Medium'|'Hard'>('Medium');
  
  // Global Settings & Stats
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [settings, setSettings] = useState<AppSettings>({
    highContrast: false,
    largeText: false
  });

  // Load stats from local storage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('medrecap_stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      // Check streak logic
      const lastDate = new Date(parsed.lastStudyDate).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
         // Simple streak logic: if studied yesterday, keep streak, else reset?
         // For demo, we just keep it.
      }
      setUserStats(parsed);
    }
  }, []);

  // Save stats helper
  const updateUserStats = (newStats: Partial<UserStats>) => {
    setUserStats(prev => {
      const updated = { ...prev, ...newStats };
      localStorage.setItem('medrecap_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectTopic = useCallback(async (topic: string) => {
    setIsLoading(true);
    try {
      const data = await generateMedicalContent(topic);
      setStudyData(data);
      setViewState(ViewState.STUDY);
      
      // Update streak if first time today
      const lastDate = new Date(userStats.lastStudyDate).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
        updateUserStats({ 
          streakDays: userStats.streakDays + 1, 
          lastStudyDate: new Date().toISOString() 
        });
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("Failed to generate study guide. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userStats]);

  const handleStartQuiz = useCallback(async (diff: 'Easy'|'Medium'|'Hard') => {
    if (!studyData) return;
    setDifficulty(diff);
    setViewState(ViewState.QUIZ);
    
    setQuizLoading(true);
    try {
      const data = await generateQuizQuestions(studyData.topic, diff);
      setQuizData(data);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      setViewState(ViewState.STUDY);
      alert("Could not generate quiz at this time.");
    } finally {
      setQuizLoading(false);
    }
  }, [studyData]);

  const handleCompleteQuiz = (score: number, total: number) => {
    // Gamification: Award points
    const pointsEarned = score * 10;
    updateUserStats({ 
      points: userStats.points + pointsEarned,
      topicsMastered: score >= total * 0.8 ? userStats.topicsMastered + 1 : userStats.topicsMastered 
    });
    handleCloseQuiz();
  };

  const handleCloseQuiz = () => {
    setViewState(ViewState.STUDY);
    setQuizData(null);
  };

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Apply accessibility classes to main wrapper
  const appClasses = `min-h-screen transition-colors duration-300 ${
    settings.highContrast ? 'bg-white text-black' : 'bg-slate-50 text-slate-900'
  } ${settings.largeText ? 'text-lg' : 'text-base'}`;

  return (
    <div className={appClasses}>
      <Header 
        onHome={() => setViewState(ViewState.HOME)} 
        stats={userStats}
        settings={settings}
        onToggleSetting={toggleSetting}
      />

      <main>
        {viewState === ViewState.HOME && (
          <TopicSelector 
            onSelectTopic={handleSelectTopic} 
            isLoading={isLoading}
            userStats={userStats}
            onMoodUpdate={(mood) => updateUserStats({ moodScore: mood })}
            settings={settings}
          />
        )}

        {viewState === ViewState.STUDY && studyData && (
          <StudyContent 
            data={studyData} 
            onStartQuiz={handleStartQuiz}
            settings={settings}
            onNextTopic={handleSelectTopic}
          />
        )}

        {viewState === ViewState.QUIZ && (
          <>
            {studyData && (
              <StudyContent 
                data={studyData} 
                onStartQuiz={() => {}} 
                settings={settings}
                onNextTopic={() => {}}
              />
            )}
            <QuizModal 
              quizData={quizData} 
              isLoading={quizLoading} 
              onClose={handleCloseQuiz} 
              onComplete={handleCompleteQuiz}
              settings={settings}
              difficulty={difficulty}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
