import React, { useState } from 'react';
import { Search, ArrowRight, Heart, Brain, Activity, Box, Zap, Layout, Volume2, Globe } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      {/* Hero Section with Benefits Highlight */}
      <div className="text-center mb-12">
        <span className="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-700 text-xs font-bold mb-6 tracking-widest uppercase">
          AI for Healthcare & Wellness
        </span>
        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Master Medicine.<br className="hidden sm:block" />
          <span className="text-teal-600">Without the Burnout.</span>
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
            <h3 className="font-bold text-slate-900 text-sm mb-1">Instant Clarity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Gemini 2.5 automates the heavy lifting, bridging basic science with clinical practice instantly.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Layout className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Zen Mode</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Mental health matters. Study in a distraction-free interface designed to lower cognitive load.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Volume2 className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Accessibility</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Built for all learners. Listen to summaries with AI Text-to-Speech and view auto-generated visuals.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Global Access</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Bridging educational gaps. Share topics instantly with peers to democratize medical knowledge.</p>
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
            className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-slate-200 shadow-lg shadow-slate-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all pl-14"
            disabled={isLoading}
          />
          <Search className="absolute left-5 text-slate-400 w-6 h-6" />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
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
    </div>
  );
};

export default TopicSelector;