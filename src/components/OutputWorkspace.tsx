import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Wand2,
  ChevronUp,
  ChevronDown,
  Brain,
  PanelsTopLeft
} from 'lucide-react';
import type { LayoutIssue, ViewportBreakpoint } from '../types';
import { VIEWPORT_NUMBERS } from '../engine/analyzer/boxModelSimulator';
import { applyAutoFix } from '../engine/recommendations/recommendationEngine';
import { ViewportBar } from './ViewportBar';

interface OutputWorkspaceProps {
  html: string;
  css: string;
  js: string;
  issues: LayoutIssue[];
  healthScore: number;
  theme: 'light' | 'dark';
  onApplyFix: (issue: LayoutIssue) => void;
  onApplyAllFixes: () => void;
  onOpenAIDiagnostics?: () => void;
  onClose: () => void;
  onOpenWorkspaces?: () => void;
}

type CompareMode = 'Single Preview' | 'Side By Side';

export const OutputWorkspace: React.FC<OutputWorkspaceProps> = ({
  html,
  css,
  js,
  issues,
  theme,
  onApplyFix,
  onApplyAllFixes,
  onOpenAIDiagnostics,
  onClose,
  onOpenWorkspaces
}) => {
  const isLight = theme === 'light';

  // State Management
  const [selectedViewport, setSelectedViewport] = useState<ViewportBreakpoint>('1024px');
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [compareMode, setCompareMode] = useState<CompareMode>('Single Preview');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [scrolledDeep, setScrolledDeep] = useState<boolean>(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const deep = e.currentTarget.scrollTop > 240;
    setScrolledDeep(deep);
    if (deep) setIsInspectorOpen(true);
  };
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [dismissedIssueIds, setDismissedIssueIds] = useState<Set<string>>(new Set());
  const [showFixed, setShowFixed] = useState<boolean>(false);

  // Active (non-dismissed) issues
  const activeIssues = useMemo(() => {
    return issues.filter(issue => !dismissedIssueIds.has(issue.id));
  }, [issues, dismissedIssueIds]);

  // Selected issue details
  const selectedIssue = useMemo(() => {
    if (activeIssues.length === 0) return null;
    return activeIssues.find(i => i.id === selectedIssueId) || activeIssues[0];
  }, [activeIssues, selectedIssueId]);

  // Initialize selected issue
  useEffect(() => {
    if (activeIssues.length > 0 && (!selectedIssueId || !activeIssues.some(i => i.id === selectedIssueId))) {
      setSelectedIssueId(activeIssues[0].id);
    }
  }, [activeIssues, selectedIssueId]);

  // Compute fixed CSS for comparison preview
  const fixedCss = useMemo(() => {
    let resultCss = css;
    activeIssues.forEach(issue => {
      if (issue.recommendedFix && issue.recommendedFix.patchTarget === 'css') {
        resultCss = applyAutoFix(resultCss, issue);
      }
    });
    return resultCss;
  }, [css, activeIssues]);

  // Generate document content for iframe (Original vs Fixed)
  const generateDoc = (contentCss: string, enableOverlay: boolean) => {
    let overlayStyles = '';
    let overlayBadges = '';

    if (enableOverlay && activeIssues.length > 0) {
      overlayStyles = `
        @keyframes ai-pulse-border {
          0% { outline-color: #f43f5e; box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .ai-problem-highlight {
          outline: 3px dashed #f43f5e !important;
          outline-offset: 3px !important;
          animation: ai-pulse-border 1.8s infinite !important;
          position: relative !important;
        }
        .ai-annotation-pointer {
          position: absolute;
          top: -24px;
          left: 0;
          z-index: 99999;
          background: #f43f5e;
          color: #ffffff;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          white-space: nowrap;
          pointer-events: auto;
          cursor: pointer;
        }
        .ai-annotation-pointer::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 8px;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid #f43f5e;
        }
      `;

      activeIssues.forEach((issue) => {
        const selector = issue.affectedElement;
        overlayBadges += `
          try {
            const els = document.querySelectorAll('${selector}');
            els.forEach(el => {
              el.classList.add('ai-problem-highlight');
              if (!el.querySelector('.ai-annotation-pointer')) {
                const badge = document.createElement('div');
                badge.className = 'ai-annotation-pointer';
                badge.innerHTML = '⚠ ${issue.title} (${issue.confidenceScore}%)';

                if (getComputedStyle(el).position === 'static') {
                  el.style.position = 'relative';
                }
                el.appendChild(badge);

                badge.addEventListener('click', () => {
                  window.parent.postMessage({ type: 'SELECT_ISSUE', id: '${issue.id}' }, '*');
                });
              }
            });
          } catch(e){}
        `;
      });
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 1rem;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: ${isLight ? '#ffffff' : '#090d16'};
              color: ${isLight ? '#0f172a' : '#e0f2fe'};
            }
            ${contentCss}
            ${overlayStyles}
          </style>
        </head>
        <body>
          ${html}
          <script>
            try { ${js} } catch (e) { console.error('User script error:', e); }
            window.addEventListener('DOMContentLoaded', () => {
              ${overlayBadges}
            });
            setTimeout(() => {
              ${overlayBadges}
            }, 300);
          </script>
        </body>
      </html>
    `;
  };

  const beforeDoc = useMemo(() => generateDoc(css, true), [html, css, js, isLight, activeIssues]);
  const afterDoc = useMemo(() => generateDoc(fixedCss, false), [html, fixedCss, js, isLight]);

  // Handle post messages from iframe to select layout issues
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SELECT_ISSUE') {
        setSelectedIssueId(e.data.id);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const targetWidth = customWidth > 0 ? customWidth : VIEWPORT_NUMBERS[selectedViewport];

  // Full-height preview frames (fill the visible page height, scroll naturally when taller)
  const frameHeight = 'calc(100vh - 280px)';

  // Styling Tokens
  const bg = isLight ? 'bg-slate-50' : 'bg-slate-950';
  const panelBg = isLight ? 'bg-white' : 'bg-slate-900';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const titleText = isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-100 to-indigo-300';
  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`h-full flex flex-col font-sans overflow-hidden transition-colors ${bg} ${text}`}>
      {/* ── HEADER ── */}
      <header className={`h-26 px-6 flex items-center justify-between border-b shrink-0 ${panelBg} ${border}`}>
        <div className="flex items-center space-x-4">
          {onOpenWorkspaces && (
            <button
              onClick={onOpenWorkspaces}
              className={`p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
              title="Back to Workspaces"
            >
              <PanelsTopLeft className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-semibold">Back to Workspaces</span>
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title="Return to HTML/CSS IDE Code Editor"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-semibold">Back to IDE</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`font-extrabold text-xl tracking-tight ${titleText}`}>
                AI Visual Output Workspace
              </h1>
            </div>
          </div>
        </div>

        {/* Explainable AI + Apply Fixes + Compare Mode Selector */}
        <div className="flex items-center space-x-3">
          {onOpenAIDiagnostics && (
            <button
              onClick={onOpenAIDiagnostics}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border shadow-md transition-all hover:scale-[1.03] active:scale-95 ${
                isLight
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-indigo-600/25'
                  : 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white border-indigo-600 shadow-indigo-700/25'
              }`}
              title="Open the Explainable AI Diagnostics page"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Explainable AI</span>
            </button>
          )}
          {activeIssues.length > 0 && (
            <button
              onClick={onApplyAllFixes}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border shadow-md transition-all hover:scale-[1.03] active:scale-95 ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/25'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600 shadow-emerald-700/25'
              }`}
              title="Apply all detected fixes and clear AI Findings"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Apply Fixes ({activeIssues.length})</span>
            </button>
          )}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['Single Preview', 'Side By Side'] as CompareMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setCompareMode(mode)}
                className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  compareMode === mode
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      <ViewportBar
        selectedViewport={selectedViewport}
        onSelectViewport={vp => { setSelectedViewport(vp); setCustomWidth(0); }}
        customWidth={customWidth}
        onCustomWidthChange={setCustomWidth}
        theme={theme}
        issues={activeIssues}
      />

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left/Center Panels for Render Outputs */}
        <div
          ref={previewScrollRef}
          onScroll={handlePreviewScroll}
          className="flex-1 p-6 overflow-auto flex flex-col items-center justify-start relative"
        >
          
          {/* COMPATIBILITY PREVIEWS */}
          <div className="flex-1 w-full max-w-6xl flex items-center justify-center">

            {/* MODE 0: SINGLE PREVIEW (individual spec) */}
            {compareMode === 'Single Preview' && (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() => setShowFixed(false)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      !showFixed
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : isLight ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Original Output
                  </button>
                  <button
                    onClick={() => setShowFixed(true)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                      showFixed
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                        : isLight ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    AI Fixed Output
                  </button>
                </div>

                <div
                  className={`rounded-2xl border-4 shadow-2xl overflow-hidden relative ${
                    isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'
                  }`}
                  style={{ width: `${targetWidth}px`, height: frameHeight, minHeight: '480px', maxWidth: '100%' }}
                >
                  <iframe
                    title={showFixed ? 'Single Fixed Preview Frame' : 'Single Original Preview Frame'}
                    srcDoc={showFixed ? afterDoc : beforeDoc}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                  />
                  <div className={`absolute top-3 ${showFixed ? 'right-3' : 'left-3'} text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm`}
                    style={{ backgroundColor: showFixed ? '#059669' : '#e11d48' }}>
                    {showFixed ? 'AFTER AI FIX' : 'BEFORE OUTPUT'}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 1: SIDE BY SIDE */}
            {compareMode === 'Side By Side' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Before Panel */}
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-2xl border-4 shadow-2xl overflow-hidden relative ${
                      isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'
                    }`}
                    style={{ width: `${targetWidth}px`, height: frameHeight, minHeight: '480px', maxWidth: '100%' }}
                  >
                    <iframe
                      title="Before Preview Frame"
                      srcDoc={beforeDoc}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>

                {/* After Panel */}
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-2xl border-4 shadow-2xl overflow-hidden relative ${
                      isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'
                    }`}
                    style={{ width: `${targetWidth}px`, height: frameHeight, minHeight: '480px', maxWidth: '100%' }}
                  >
                    <iframe
                      title="After Preview Frame"
                      srcDoc={afterDoc}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── STICKY EXPLAINABLE AI INSPECTOR (appears on deep scroll) ── */}
          {scrolledDeep && (
            <div className="sticky bottom-0 w-full z-30 mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.2)] overflow-hidden">
              <div
                onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                className="px-4 py-2 flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Explainable AI Inspector
                  </span>
                  {selectedIssue && (
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                      {selectedIssue.title} [{selectedIssue.severity}]
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] ${mutedText}`}>{isInspectorOpen ? 'Collapse Details' : 'Expand Details'}</span>
                  {isInspectorOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>

              {isInspectorOpen && (
                <div className="px-4 py-4 max-h-80 overflow-y-auto">
                  {selectedIssue ? (
                    <div className="space-y-4">
                      {/* Title & Metadata + Actions */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            selectedIssue.severity === 'Critical' ? 'bg-red-600 text-white' :
                            selectedIssue.severity === 'High' ? 'bg-orange-500 text-white' :
                            'bg-amber-500 text-white'
                          }`}>
                            {selectedIssue.severity}
                          </span>
                          <span className="font-bold text-sm text-rose-600 dark:text-rose-400">{selectedIssue.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Confidence: {selectedIssue.confidenceScore}% · Target Viewport: {selectedIssue.affectedViewport.join(', ')}
                          </span>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                          <button
                            onClick={() => {
                              onApplyFix(selectedIssue);
                              alert('AI Code Patch Applied to index.css!');
                            }}
                            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Apply Fix</span>
                          </button>
                          <button
                            onClick={() => {
                              setDismissedIssueIds(prev => {
                                const copy = new Set(prev);
                                copy.add(selectedIssue.id);
                                return copy;
                              });
                            }}
                            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {/* Explanation Grid (full width) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Root Cause Analysis</span>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 h-full">
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                              {selectedIssue.rootCause}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Affected CSS Rule</span>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 h-full">
                            <code className="text-[11px] font-mono text-cyan-400 block break-all">
                              {selectedIssue.cssProperty}
                            </code>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Affected Component Node</span>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 h-full">
                            <code className="text-[11px] font-mono text-indigo-300 block break-all">
                              {`// Affected Element:\n<${selectedIssue.affectedElement} />`}
                            </code>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended Code Patch</span>
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono leading-relaxed space-y-1 h-full">
                            <div className="text-rose-500 line-through truncate">
                              - {selectedIssue.recommendedFix.originalSnippet}
                            </div>
                            <div className="text-emerald-500 font-semibold truncate">
                              + {selectedIssue.recommendedFix.replacementSnippet}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected Layout Improvement</span>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg h-full">
                            {selectedIssue.recommendedFix.description || 'Restores element alignment, solves responsiveness, and fixes overflow bounding boxes.'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Other Flagged Anomaly Nodes</span>
                          <div className="space-y-1.5 h-full">
                            {activeIssues.filter(i => i.id !== selectedIssue.id).length === 0 ? (
                              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-500">
                                No other issues detected.
                              </div>
                            ) : (
                              activeIssues.filter(i => i.id !== selectedIssue.id).map(issue => (
                                <button
                                  key={issue.id}
                                  onClick={() => setSelectedIssueId(issue.id)}
                                  className={`w-full text-left p-2 rounded-lg border text-[11px] flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 ${
                                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                                  }`}
                                >
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate mr-2">{issue.title}</span>
                                  <span className="text-[9px] bg-rose-500/10 text-rose-500 px-1 rounded shrink-0">{issue.severity}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Workspace Clear</span>
                      <p className={`text-[10px] ${mutedText}`}>No issues remain. Layout matches perfect design rules.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
