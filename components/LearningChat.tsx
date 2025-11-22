import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Search, ExternalLink, Bot, User, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/gemini';
import { Chat, GenerateContentResponse } from "@google/genai";

interface LearningChatProps {
  topic: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

const LearningChat: React.FC<LearningChatProps> = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'model',
      text: `Hi! I'm your AI Medical Tutor. I can help answer questions about **${topic}**. I can also search the web for the latest clinical guidelines if needed.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep chat session ref to persist across renders
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize chat session when component mounts
    chatSession.current = createChatSession(topic);
  }, [topic]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chatSession.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to Gemini
      const result = await chatSession.current.sendMessageStream({ message: userMsg.text });
      
      const aiMsgId = (Date.now() + 1).toString();
      let fullText = '';
      let sources: { title: string; uri: string }[] = [];

      // Add placeholder message
      setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);

      for await (const chunk of result) {
        // Safe casting/checking for text
        const chunkText = chunk.text; // Access getter directly
        if (chunkText) {
            fullText += chunkText;
        }

        // Check for grounding metadata in the chunk (candidates)
        const grounding = chunk.candidates?.[0]?.groundingMetadata;
        if (grounding?.groundingChunks) {
             // Extract sources
             grounding.groundingChunks.forEach((c: any) => {
                if (c.web) {
                    sources.push({ title: c.web.title, uri: c.web.uri });
                }
             });
        }
        
        // Remove duplicates from sources based on URI
        sources = sources.filter((s, index, self) => 
            index === self.findIndex((t) => (
                t.uri === s.uri
            ))
        );

        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
            ? { ...msg, text: fullText, sources: sources.length > 0 ? sources : undefined }
            : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "I'm sorry, I encountered an error. Please try asking again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-xl hover:bg-teal-700 transition-all hover:scale-105 z-40 group flex items-center gap-2"
        title="Ask AI Tutor"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">
           Ask Tutor
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-sm md:max-w-md bg-white rounded-2xl shadow-2xl z-40 flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[600px] max-h-[80vh]">
      
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-teal-500 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-sm">MedRecap Tutor</h3>
                <p className="text-xs text-slate-300 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Powered by Gemini
                </p>
            </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Sources / Grounding */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <Search className="w-3 h-3 mr-1" />
                        Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => (
                            <a 
                                key={i}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center max-w-full text-xs bg-slate-100 hover:bg-slate-200 text-teal-700 px-2 py-1 rounded border border-slate-200 transition-colors truncate"
                            >
                                <ExternalLink className="w-3 h-3 mr-1 shrink-0" />
                                <span className="truncate max-w-[150px]">{source.title || 'Web Source'}</span>
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 flex items-center space-x-1 shadow-sm">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about this topic..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-teal-500 rounded-xl outline-none transition-all text-sm"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-400 flex items-center justify-center">
             <Search className="w-3 h-3 mr-1" />
             AI can access Google Search to find answers
           </p>
        </div>
      </div>
    </div>
  );
};

export default LearningChat;
