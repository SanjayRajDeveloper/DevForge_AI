import React from 'react';
import { Cpu, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className={`h-18 px-6 flex items-center justify-between shadow-sm border-b select-none transition-colors ${
        isLight
          ? 'bg-white border-blue-100 text-slate-900'
          : 'bg-slate-950 border-slate-800 text-slate-100'
      }`}
    >
      {/* Brand & Project Identity */}
      <div className="flex items-center space-x-3 group">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${
            isLight
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
              : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-cyan-500/20'
          }`}
        >
          <Cpu className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1
              className={`font-bold text-lg tracking-tight transition-colors ${
                isLight
                  ? 'text-slate-900 group-hover:text-blue-700'
                  : 'bg-gradient-to-r from-cyan-100 via-sky-200 to-indigo-300 bg-clip-text text-transparent'
              }`}
            >
              SmartLayout AI
            </h1>
          </div>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Pre-Render Responsive Layout Failure Predictor & XAI Engine
          </p>
        </div>
      </div>

      {/* Action Buttons & Theme Toggle */}
      <div className="flex items-center space-x-3">
        {/* Sun / Moon Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition-all duration-200 hover:scale-110 hover:rotate-6 active:scale-95 flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800 hover:shadow-md'
          }`}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Blue & White Theme'}
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
