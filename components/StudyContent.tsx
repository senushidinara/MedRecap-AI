import React, { useState, useRef, useEffect } from 'react';
import { StudyGuide } from '../types';
import { BookOpen, Activity, Brain, GraduationCap, Image as ImageIcon, Eye, EyeOff, CheckCircle, Play, PenTool, Volume2, Share2, Moon, Sun, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { generateAnatomyImage, generateSpeech } from '../services/gemini';
import MatchingGame from './MatchingGame';
import DrawingBoard from './DrawingBoard';
import LearningChat from './LearningChat';
import MermaidDiagram from './MermaidDiagram';

interface StudyContentProps {
  data: StudyGuide;
  onStartQuiz: () => void;
}

const StudyContent: React.FC<StudyContentProps> = ({ data, onStartQuiz }) => {
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [hiddenImages, setHiddenImages] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const [visualTabs, setVisualTabs] = useState<Record<string, 'ai' | 'draw'>>({});
  
  // New Features State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Helper: Decode Base64
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const handlePlaySummary = async () => {
    if (isPlayingAudio) {
      // Stop playback
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsAudioLoading(true);
    try {
      const base64Audio = await generateSpeech(data.overview);
      if (!base64Audio) throw new Error("No audio generated");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBytes = decodeBase64(base64Audio);
      
      // PCM decoding for 24kHz mono (standard for Gemini TTS)
      const dataInt16 = new Int16Array(audioBytes.buffer);
      const frameCount = dataInt16.length;
      const audioBuffer = audioContextRef.current.createBuffer(1, frameCount, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setIsPlayingAudio(false);
      source.start();
      
      audioSourceRef.current = source;
      setIsPlayingAudio(true);

    } catch (error) {
      console.error("Audio playback failed:", error);
      alert("Could not play audio summary.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleShare = async () => {
    const textToShare = `Studying ${data.topic} on MedRecap AI.\n\nOverview: ${data.overview}`;
    try {
      await navigator.clipboard.writeText(textToShare);
      alert("Topic summary copied to clipboard! Share it with your peers.");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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

  const setTab = (sectionTitle: string, tab: 'ai' | 'draw') => {
    setVisualTabs(prev => ({ ...prev, [sectionTitle]: tab }));
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className={`transition-all duration-500 ${zenMode ? 'fixed inset-0 z-50 bg-slate-50 overflow-y-auto' : 'relative'}`}>
      
      <div className={`mx-auto px-4 py-8 pb-40 relative ${zenMode ? 'max-w-4xl mt-8' : 'max-w-5xl'}`}>
        
        {/* Utility Bar - Always visible and prominent */}
        <div className="flex justify-end space-x-3 mb-6 sticky top-4 z-40">
           <button 
             onClick={handleShare}
             className="flex items-center space-x-2 px-4 py-2 bg-white text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 shadow-md border border-slate-200 transition-all font-medium text-sm"
             title="Share with Peers (Public Health)"
           >
             <Share2 className="w-4 h-4" />
             <span>Share</span>
           </button>
           <button 
             onClick={() => setZenMode(!zenMode)}
             className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-md border transition-all font-medium text-sm ${zenMode ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'}`}
             title="Toggle Zen Mode (Mental Wellness)"
           >
             {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             <span>{zenMode ? 'Exit Zen' : 'Zen Mode'}</span>
           </button>
        </div>

        {/* Hero Header */}
        <div className="mb-10 text-center sm:text-left">
          {!zenMode && (
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold border border-teal-100">
              <Brain className="w-4 h-4" />
              <span>Clinical Anatomy Recap</span>
            </div>
          )}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">{data.topic}</h1>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-teal-500 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                Quick Overview
              </h3>
              <button
                onClick={handlePlaySummary}
                disabled={isAudioLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                  isPlayingAudio 
                    ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-200 animate-pulse' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                title="Accessibility: Listen to Overview"
              >
                {isAudioLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span>{isPlayingAudio ? 'Stop Audio' : 'Listen to Summary'}</span>
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">{data.overview}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-20">
          {data.sections.map((section, idx) => {
            const currentTab = visualTabs[section.title] || 'ai';
            
            return (
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
                  <div className="flex flex-col h-full space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col flex-grow">
                      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center">
                        <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Foundational Anatomy</h3>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Year 1 Basis</p>
                        </div>
                      </div>
                      <div className="p-6 text-slate-700 leading-relaxed flex-grow prose prose-sm max-w-none whitespace-pre-wrap">
                        {section.foundational}
                      </div>
                    </div>
                    
                    {/* Mermaid Diagram */}
                    {section.mermaidChart && (
                       <MermaidDiagram chart={section.mermaidChart} />
                    )}
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
                    <div className="p-6 text-slate-700 leading-relaxed flex-grow bg-rose-50/10 border-t border-dashed border-rose-100 whitespace-pre-wrap">
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
                    <div>
                      {/* Visual Tabs */}
                      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-2 border border-slate-200">
                        <button 
                          onClick={() => setTab(section.title, 'ai')}
                          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center transition-all ${currentTab === 'ai' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                          <ImageIcon className="w-3 h-3 mr-2" />
                          AI Diagram
                        </button>
                        <button 
                          onClick={() => setTab(section.title, 'draw')}
                          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center transition-all ${currentTab === 'draw' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                          <PenTool className="w-3 h-3 mr-2" />
                          Sketchpad
                        </button>
                      </div>

                      <div className="bg-slate-100 rounded-xl p-1 border border-slate-200 relative">
                        
                        {/* AI Diagram Tab */}
                        <div className={currentTab === 'ai' ? 'block' : 'hidden'}>
                          {!generatedImages[section.title] && !generatingImageFor && (
                            <button 
                              onClick={() => handleGenerateImage(section.title)}
                              className="w-full h-[320px] flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200 rounded-lg transition-colors border-2 border-dashed border-slate-300 hover:border-slate-400"
                            >
                              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                              <span className="font-medium text-sm">Visualize Anatomy</span>
                              <span className="text-xs opacity-70">Click to generate diagram</span>
                            </button>
                          )}

                          {generatingImageFor === section.title && (
                             <div className="w-full h-[320px] flex flex-col items-center justify-center bg-white rounded-lg">
                                <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
                                <span className="text-xs font-medium text-teal-700 animate-pulse">Drawing diagram...</span>
                             </div>
                          )}

                          {generatedImages[section.title] && (
                            <div className="relative bg-white rounded-lg overflow-hidden group-image">
                              <div className={`transition-all duration-500 w-full h-[320px] flex items-center justify-center bg-white ${hiddenImages[section.title] ? 'blur-xl opacity-50' : 'blur-0 opacity-100'}`}>
                                <img 
                                  src={generatedImages[section.title]} 
                                  alt={`${section.title} Anatomy`} 
                                  className="w-full h-full object-contain"
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
                            <div className="p-4 text-center text-red-500 text-sm h-[320px] flex items-center justify-center">
                              {imageErrors[section.title]}
                            </div>
                          )}
                        </div>

                        {/* Sketchpad Tab */}
                        <div className={currentTab === 'draw' ? 'block' : 'hidden'}>
                           <DrawingBoard sectionTitle={section.title} />
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {idx < data.sections.length - 1 && (
                   <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Footer for Quiz */}
        {!zenMode && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
            <button
              onClick={onStartQuiz}
              className="pointer-events-auto bg-slate-900 text-white shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl px-8 py-4 flex items-center font-bold text-lg border border-slate-700"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              I'm Ready for the Quiz
            </button>
          </div>
        )}

        {/* Floating Chat Widget */}
        {!zenMode && <LearningChat topic={data.topic} />}

      </div>
    </div>
  );
};

export default StudyContent;