import React from 'react';
import { ArrowLeft, Brain, AlertTriangle } from 'lucide-react';
import { AIDiagnosticsPanel } from '../panels/AIDiagnosticsPanel';
import type { LayoutIssue } from '../../types';

interface AIDiagnosticsPageProps {
  issues: LayoutIssue[];
  html: string;
  css: string;
  theme: 'light' | 'dark';
  onApplyFix: (issue: LayoutIssue) => void;
  onBack: () => void;
}

export const AIDiagnosticsPage: React.FC<AIDiagnosticsPageProps> = ({
  issues,
  html,
  css,
  theme,
  onApplyFix,
  onBack
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
      <header
        className={`h-14 px-5 flex items-center justify-between border-b shrink-0 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center border transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Return to the AI Output Workspace"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Workspace</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950 text-indigo-400'}`}>
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h1 className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Explainable AI Diagnostics
              </h1>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Errors detected in the current code
              </p>
            </div>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
            issues.length > 0
              ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950 text-rose-300 border-rose-800'
              : isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>{issues.length} Errors</span>
        </span>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto max-w-3xl px-4 py-4">
          <div
            className={`h-full rounded-2xl overflow-hidden border shadow-md ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900 border-slate-800 shadow-black/40'
            }`}
          >
            <AIDiagnosticsPanel
              issues={issues}
              html={html}
              css={css}
              onApplyFix={onApplyFix}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};