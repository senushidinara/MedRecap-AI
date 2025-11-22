import React, { useState } from 'react';
import { Search, ArrowRight, Heart, Brain, Activity, Box } from 'lucide-react';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
}

const SUGGESTED_TOPICS = [
  { name: "Thoracic Surface Anatomy", icon: Box, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Coronary Circulation", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Cranial Nerves", icon: Brain, color: "text-amber-500", bg: "bg-amber-50" },
  { name: "Brachial Plexus", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
];

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSelectTopic(input.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Clinical Anatomy Recap
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Review high-yield anatomy and clinical correlations. Interactive diagrams, mnemonics, and quizzes designed for rapid doctor recap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-12">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Circle of Willis, Rotator Cuff, Cardiac Cycle..."
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-slate-200 shadow-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all pl-14"
            disabled={isLoading}
          />
          <Search className="absolute left-5 text-slate-400 w-6 h-6" />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bg-teal-600 text-white p-2.5 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUGGESTED_TOPICS.map((topic) => (
          <button
            key={topic.name}
            onClick={() => onSelectTopic(topic.name)}
            disabled={isLoading}
            className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all text-left group"
          >
            <div className={`p-3 rounded-lg ${topic.bg} mr-4 group-hover:scale-110 transition-transform`}>
              <topic.icon className={`w-6 h-6 ${topic.color}`} />
            </div>
            <span className="font-medium text-slate-700 group-hover:text-teal-700">{topic.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;