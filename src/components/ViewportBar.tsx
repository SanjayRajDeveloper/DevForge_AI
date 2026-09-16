import React from 'react';
import type { ViewportBreakpoint, LayoutIssue } from '../types';
import { Smartphone, Tablet, Monitor, Laptop } from 'lucide-react';

interface ViewportBarProps {
  selectedViewport: ViewportBreakpoint;
  onSelectViewport: (vp: ViewportBreakpoint) => void;
  customWidth: number;
  onCustomWidthChange: (w: number) => void;
  theme: 'light' | 'dark';
  issues?: LayoutIssue[];
}

export const BREAKPOINT_DEVICES: { id: ViewportBreakpoint; label: string; icon: any }[] = [
  { id: '320px', label: 'Mobile S (320px)', icon: Smartphone },
  { id: '375px', label: 'Mobile M (375px)', icon: Smartphone },
  { id: '425px', label: 'Mobile L (425px)', icon: Smartphone },
  { id: '768px', label: 'Tablet (768px)', icon: Tablet },
  { id: '1024px', label: 'Laptop (1024px)', icon: Laptop },
  { id: '1440px', label: 'Desktop (1440px)', icon: Monitor }
];

export const ViewportBar: React.FC<ViewportBarProps> = ({
  selectedViewport,
  onSelectViewport,
  customWidth,
  onCustomWidthChange,
  theme,
  issues
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`h-12 px-4 flex items-center justify-between text-xs select-none border-b transition-colors ${
        isLight
          ? 'bg-slate-50 border-slate-200 text-slate-700'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-center space-x-1 overflow-x-auto py-1">
        <span
          className={`text-[11px] font-semibold mr-2 uppercase tracking-wider ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Breakpoints:
        </span>
        {BREAKPOINT_DEVICES.map((dev) => {
          const Icon = dev.icon;
          const isActive = selectedViewport === dev.id;
          const issueCount = issues ? issues.filter(i => i.affectedViewport.includes(dev.id)).length : 0;
          return (
            <button
              key={dev.id}
              onClick={() => onSelectViewport(dev.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1.5 transition-all ${
                isActive
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : isLight
                  ? 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{dev.label}</span>
              {issueCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-1" />
              )}
            </button>
          );
        })}
      </div>

      <div
        className={`hidden lg:flex items-center space-x-3 text-xs ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        <span>Custom Width:</span>
        <input
          type="range"
          min={300}
          max={1600}
          value={customWidth}
          onChange={(e) => onCustomWidthChange(Number(e.target.value))}
          className="w-32 accent-blue-600 cursor-pointer"
        />
        <span
          className={`font-mono font-bold w-12 text-right ${
            isLight ? 'text-slate-900' : 'text-slate-200'
          }`}
        >
          {customWidth}px
        </span>
      </div>
    </div>
  );
};
