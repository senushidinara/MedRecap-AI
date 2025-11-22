import React, { useState } from 'react';
import { Search, ArrowRight, Heart, Brain, Activity, Box, Zap, Layout, Volume2, Globe, TrendingUp, Smile, Frown, Meh } from 'lucide-react';
import { UserStats, AppSettings } from '../types';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
  userStats: UserStats;
  onMoodUpdate: (mood: number) => void;
  settings: AppSettings;
}

const SUGGESTED_TOPICS = [
  { name: "Thoracic Surface Anatomy", icon: Box, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Coronary Circulation", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Cranial Nerves", icon: Brain, color: "text-amber-500", bg: "bg-amber-50" },
  { name: "Brachial Plexus", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
];

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, isLoading, userStats, onMoodUpdate, settings }) => {
  const [input, setInput] = useState('');
  const [showBreathing, setShowBreathing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSelectTopic(input.trim());
    }
  };

  const handleMoodClick = (score: number) => {
    onMoodUpdate(score);
    if (score <= 2) {
      setShowBreathing(true);
      setTimeout(() => setShowBreathing(false), 5000); // Auto hide after 5s
    }
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 py-12 sm:py-16 ${settings.highContrast ? 'text-black' : ''}`}>
      
      {/* AI Analytics Dashboard - Visible if user has history */}
      {userStats.points > 0 && (
         <div className="mb-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-teal-600 mr-2" />
                  <h3 className="font-bold text-lg">Your AI Progress Dashboard</h3>
               </div>
               <p className="text-slate-600 mb-4">
                  Great job! You've mastered {userStats.topicsMastered} topics. 
                  Based on your performance, we recommend continuing with **Clinical Cardiology** next.
               </p>
               <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                  <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${Math.min(userStats.points / 100, 100)}%` }}></div>
               </div>
               <div className="text-xs text-slate-400 text-right">Next Level: {(Math.floor(userStats.points/1000) + 1) * 1000} XP</div>
            </div>

            {/* Mental Health / Stress Check */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 relative overflow-hidden">
               <h4 className="font-bold text-indigo-900 mb-2 text-sm">Mental Fatigue Check</h4>
               <p className="text-xs text-indigo-700 mb-3">How is your focus right now?</p>
               <div className="flex justify-between">
                  <button onClick={() => handleMoodClick(1)} className="p-2 hover:bg-white/50 rounded-full transition-colors" title="Stressed"><Frown className="w-6 h-6 text-rose-500" /></button>
                  <button onClick={() => handleMoodClick(3)} className="p-2 hover:bg-white/50 rounded-full transition-colors" title="Okay"><Meh className="w-6 h-6 text-amber-500" /></button>
                  <button onClick={() => handleMoodClick(5)} className="p-2 hover:bg-white/50 rounded-full transition-colors" title="Focused"><Smile className="w-6 h-6 text-emerald-500" /></button>
               </div>
               
               {showBreathing && (
                 <div className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center text-white text-center z-10 animate-in fade-in">
                    <p className="text-sm font-bold mb-2">Take a deep breath...</p>
                    <div className="w-8 h-8 rounded-full bg-white/30 animate-ping"></div>
                 </div>
               )}
            </div>
         </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-12">
        <span className="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-700 text-xs font-bold mb-6 tracking-widest uppercase">
          AI for Healthcare & Wellness
        </span>
        <h2 className={`text-4xl md:text-6xl font-extrabold mb-6 tracking-tight ${settings.highContrast ? 'text-black' : 'text-slate-900'}`}>
          Master Medicine.<br className="hidden sm:block" />
          <span className={settings.highContrast ? 'text-black underline' : 'text-teal-600'}>Without the Burnout.</span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          The first AI study companion designed for <strong>retention</strong> and <strong>mental well-being</strong>. 
          Instantly generate diagrams, audio guides, and stress-free summaries.
        </p>

        {/* 4 Pillars of Benefit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left mb-12">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Predictive AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Gemini 2.5 generates content and predicts your next study topic based on performance.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Layout className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Zen Mode</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Reduce cognitive load with distraction-free interfaces and mindfulness check-ins.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Volume2 className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Accessibility</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Includes Text-to-Speech, High Contrast modes, and Visual Recall tools for all learners.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Global Access</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Offline-ready design and easy sharing to bridge educational gaps worldwide.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-16 max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you want to master today? (e.g. Circle of Willis)"
            className={`w-full px-6 py-5 text-lg rounded-2xl border-2 shadow-lg focus:ring-4 outline-none transition-all pl-14 ${settings.highContrast ? 'border-black text-black focus:ring-black/20' : 'border-slate-200 shadow-slate-100 focus:border-teal-500 focus:ring-teal-500/20'}`}
            disabled={isLoading}
          />
          <Search className="absolute left-5 text-slate-400 w-6 h-6" />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 text-white p-3 rounded-xl transition-colors ${settings.highContrast ? 'bg-black hover:bg-slate-800' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>

      <div className="max-w-3xl mx-auto">
        <h4 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Try a Popular Topic</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic.name}
              onClick={() => onSelectTopic(topic.name)}
              disabled={isLoading}
              className={`flex items-center p-4 bg-white border rounded-xl transition-all text-left group ${settings.highContrast ? 'border-black hover:bg-slate-100' : 'border-slate-200 hover:border-teal-300 hover:shadow-md'}`}
            >
              <div className={`p-3 rounded-lg ${topic.bg} mr-4 group-hover:scale-110 transition-transform`}>
                <topic.icon className={`w-6 h-6 ${topic.color}`} />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-teal-700">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;
