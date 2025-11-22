import React, { useState } from 'react';
import { StudyGuide } from '../types';
import { BookOpen, Activity, Brain, GraduationCap, Image as ImageIcon, Eye, EyeOff, CheckCircle, Play } from 'lucide-react';
import { generateAnatomyImage } from '../services/gemini';
import MatchingGame from './MatchingGame';

interface StudyContentProps {
  data: StudyGuide;
  onStartQuiz: () => void;
}

const StudyContent: React.FC<StudyContentProps> = ({ data, onStartQuiz }) => {
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [hiddenImages, setHiddenImages] = useState<Record<string, boolean>>({}); // To toggle visibility
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

  const handleGenerateImage = async (sectionTitle: string) => {
    if (generatedImages[sectionTitle] || generatingImageFor) return;

    setGeneratingImageFor(sectionTitle);
    try {
      const imageUrl = await generateAnatomyImage(data.topic, sectionTitle);
      setGeneratedImages(prev => ({ ...prev, [sectionTitle]: imageUrl }));
      setHiddenImages(prev => ({ ...prev, [sectionTitle]: false }));
    } catch (error) {
      console.error(error);
      setImageErrors(prev => ({ ...prev, [sectionTitle]: "Failed to generate image." }));
    } finally {
      setGeneratingImageFor(null);
    }
  };

  const toggleImageVisibility = (sectionTitle: string) => {
    setHiddenImages(prev => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-40">
      {/* Hero Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 mb-4 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold border border-teal-100">
          <Brain className="w-4 h-4" />
          <span>Clinical Anatomy Recap</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">{data.topic}</h1>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-teal-500">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
            Quick Overview
          </h3>
          <p className="text-slate-600 leading-relaxed text-lg">{data.overview}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-20">
        {data.sections.map((section, idx) => (
          <div key={idx} className="relative group">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-2xl font-bold mr-4 text-xl shadow-lg">
                {idx + 1}
              </div>
              <h2 className="text-3xl font-bold text-slate-800">{section.title}</h2>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Foundational Card */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center">
                  <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Foundational Anatomy</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Year 1 Basis</p>
                  </div>
                </div>
                <div className="p-6 text-slate-700 leading-relaxed flex-grow prose prose-sm max-w-none">
                  {section.foundational}
                </div>
              </div>

              {/* Clinical Card */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center">
                  <div className="p-1.5 bg-rose-100 rounded-lg mr-3">
                    <Activity className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Clinical Application</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Year 3 Pathology</p>
                  </div>
                </div>
                <div className="p-6 text-slate-700 leading-relaxed flex-grow bg-rose-50/10 border-t border-dashed border-rose-100">
                  {section.clinical}
                </div>
              </div>
            </div>
            
            {/* Interactive & Visual Tools */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Matching Game & Key Points */}
              <div className="md:col-span-7 space-y-6">
                 {/* Matching Game */}
                 {section.matchingPairs && section.matchingPairs.length > 0 && (
                   <MatchingGame pairs={section.matchingPairs} />
                 )}

                 {/* Key Points */}
                 <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                    <h4 className="text-amber-800 font-bold mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      High Yield Facts
                    </h4>
                    <ul className="space-y-2">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start text-amber-900 text-sm">
                          <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>

              {/* Right Column: Mnemonics & Visuals */}
              <div className="md:col-span-5 space-y-6">
                 {/* Mnemonics */}
                 {section.mnemonics && section.mnemonics.length > 0 && (
                  <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center mb-4">
                      <Brain className="w-5 h-5 text-indigo-200 mr-2" />
                      <h4 className="font-bold text-indigo-100 uppercase tracking-wider text-xs">Memory Hack</h4>
                    </div>
                    <ul className="space-y-3 relative z-10">
                      {section.mnemonics.map((m, i) => (
                        <li key={i} className="font-serif text-lg italic leading-relaxed">
                          "{m}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Visual Recall Section */}
                <div className="bg-slate-100 rounded-xl p-1 border border-slate-200">
                  {!generatedImages[section.title] && !generatingImageFor && (
                    <button 
                      onClick={() => handleGenerateImage(section.title)}
                      className="w-full h-40 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200 rounded-lg transition-colors border-2 border-dashed border-slate-300 hover:border-slate-400"
                    >
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="font-medium text-sm">Visualize Anatomy</span>
                      <span className="text-xs opacity-70">Click to generate diagram</span>
                    </button>
                  )}

                  {generatingImageFor === section.title && (
                     <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-lg">
                        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
                        <span className="text-xs font-medium text-teal-700 animate-pulse">Drawing diagram...</span>
                     </div>
                  )}

                  {generatedImages[section.title] && (
                    <div className="relative bg-white rounded-lg overflow-hidden group-image">
                      <div className={`transition-all duration-500 ${hiddenImages[section.title] ? 'blur-xl opacity-50' : 'blur-0 opacity-100'}`}>
                        <img 
                          src={generatedImages[section.title]} 
                          alt={`${section.title} Anatomy`} 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      
                      {/* Overlay controls */}
                      <div className="absolute bottom-3 right-3 flex space-x-2">
                         <button 
                           onClick={() => toggleImageVisibility(section.title)}
                           className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                           title={hiddenImages[section.title] ? "Reveal Diagram" : "Hide to Test Memory"}
                         >
                            {hiddenImages[section.title] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                         </button>
                      </div>

                      {hiddenImages[section.title] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <span className="bg-slate-900/70 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-md">
                             Can you visualize it?
                           </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {imageErrors[section.title] && (
                    <div className="p-4 text-center text-red-500 text-sm">
                      {imageErrors[section.title]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            {idx < data.sections.length - 1 && (
               <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12"></div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Footer for Quiz */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4">
        <button
          onClick={onStartQuiz}
          className="bg-slate-900 text-white shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl px-8 py-4 flex items-center font-bold text-lg border border-slate-700"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          I'm Ready for the Quiz
        </button>
      </div>
    </div>
  );
};

export default StudyContent;