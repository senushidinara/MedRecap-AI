import React, { useState } from 'react';
import { Activity, Flame, Trophy, Settings, Eye, Type, Smartphone } from 'lucide-react';
import { UserStats, AppSettings } from '../types';

interface HeaderProps {
  onHome: () => void;
  stats: UserStats;
  settings: AppSettings;
  onToggleSetting: (key: keyof AppSettings) => void;
}

const Header: React.FC<HeaderProps> = ({ onHome, stats, settings, onToggleSetting }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors ${settings.highContrast ? 'bg-white border-black' : 'bg-white border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={onHome}
          >
            <div className={`p-2 rounded-lg transition-colors ${settings.highContrast ? 'bg-black text-white' : 'bg-teal-600 text-white group-hover:bg-teal-700'}`}>
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold tracking-tight">MedRecap AI</h1>
              {!settings.largeText && (
                <p className={`text-xs ${settings.highContrast ? 'text-black' : 'text-slate-500'} hidden sm:block`}>Rapid Clinical Integration</p>
              )}
            </div>
          </div>
          
          {/* Right Side: Gamification & Settings */}
          <div className="flex items-center space-x-4 sm:space-x-6">
             
             {/* Gamification Stats */}
             <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center" title="Day Streak">
                   <Flame className={`w-5 h-5 mr-1 ${settings.highContrast ? 'text-black' : 'text-orange-500'}`} />
                   <span className="font-bold">{stats.streakDays}</span>
                </div>
                <div className="flex items-center" title="Total Points">
                   <Trophy className={`w-5 h-5 mr-1 ${settings.highContrast ? 'text-black' : 'text-yellow-500'}`} />
                   <span className="font-bold">{stats.points}</span>
                </div>
             </div>

             {/* Offline Badge (Public Health Simulation) */}
             <div className="hidden lg:flex items-center text-xs font-medium px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-600" title="Content is optimized for low-bandwidth">
                <Smartphone className="w-3 h-3 mr-1" />
                <span>Offline Ready</span>
             </div>

             {/* Settings Dropdown */}
             <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${showSettings ? 'bg-slate-100' : ''}`}
                  title="Accessibility Settings"
                >
                   <Settings className="w-6 h-6" />
                </button>

                {showSettings && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Accessibility</h4>
                    
                    <div className="space-y-3">
                       <button 
                         onClick={() => onToggleSetting('highContrast')}
                         className="flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg transition-colors"
                       >
                          <div className="flex items-center">
                             <Eye className="w-4 h-4 mr-2" />
                             <span className="text-sm font-medium">High Contrast</span>
                          </div>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.highContrast ? 'bg-black' : 'bg-slate-300'}`}>
                             <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${settings.highContrast ? 'left-4.5' : 'left-0.5'}`} style={{ left: settings.highContrast ? '18px' : '2px' }}></div>
                          </div>
                       </button>

                       <button 
                         onClick={() => onToggleSetting('largeText')}
                         className="flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg transition-colors"
                       >
                          <div className="flex items-center">
                             <Type className="w-4 h-4 mr-2" />
                             <span className="text-sm font-medium">Large Text</span>
                          </div>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.largeText ? 'bg-teal-600' : 'bg-slate-300'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all`} style={{ left: settings.largeText ? '18px' : '2px' }}></div>
                          </div>
                       </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
