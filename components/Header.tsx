import React from 'react';
import { Activity, BookOpen, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={onHome}
          >
            <div className="bg-teal-600 p-2 rounded-lg group-hover:bg-teal-700 transition-colors">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-slate-900">MedRecap AI</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Rapid Clinical Integration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="flex items-center text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                <GraduationCap className="w-4 h-4 mr-1" />
                <span>Pro Edition</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;