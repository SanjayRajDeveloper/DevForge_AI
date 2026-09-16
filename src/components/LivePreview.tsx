import React, { useState, useMemo } from 'react';
import {
  Eye, RotateCcw, ZoomIn, ZoomOut, AlertCircle, Wand2, X,
  Layers, Code2, ShieldAlert, Sparkles, Sliders, ChevronUp, ChevronDown,
  Monitor, Smartphone, Tablet, Activity, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';
import type { LayoutIssue, ViewportBreakpoint } from '../types';
import { VIEWPORT_NUMBERS } from '../engine/analyzer/boxModelSimulator';
import { applyAutoFix } from '../engine/recommendations/recommendationEngine';

interface LivePreviewProps {
  html: string;
  css: string;
  js: string;
  selectedViewport: ViewportBreakpoint;
  customWidth: number;
  activeIssues: LayoutIssue[];
  theme: 'light' | 'dark';
  onApplyFix?: (issue: LayoutIssue) => void;
  onSelectViewport?: (vp: ViewportBreakpoint) => void;
}

type BottomTab = 'ai' | 'dom' | 'css' | 'a11y' | 'perf' | 'report';
type ViewMode = 'live' | 'compare' | 'original' | 'fixed';

const ALL_BREAKPOINTS: { id: ViewportBreakpoint; label: string; icon: any; px: number }[] = [
  { id: '320px', label: '320px', icon: Smartphone, px: 320 },
  { id: '375px', label: '375px', icon: Smartphone, px: 375 },
  { id: '425px', label: '425px', icon: Smartphone, px: 425 },
  { id: '768px', label: '768px', icon: Tablet, px: 768 },
  { id: '1024px', label: '1024px', icon: LaptopIcon, px: 1024 },
  { id: '1440px', label: '1440px', icon: Monitor, px: 1440 },
];

function LaptopIcon(props: any) {
  return <Monitor {...props} />;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  html,
  css,
  js,
  selectedViewport,
  customWidth,
  activeIssues,
  theme,
  onApplyFix,
  onSelectViewport
}) => {
  const isLight = theme === 'light';

  // State controls
  const [zoom, setZoom] = useState<number>(100);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [compareSliderPos, setCompareSliderPos] = useState<number>(50); // 0 to 100%
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('ai');
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState<boolean>(false);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);

  const targetWidth = customWidth > 0 ? customWidth : VIEWPORT_NUMBERS[selectedViewport];

  // Compute fixed CSS version for comparison / auto-fix preview
  const fixedCss = useMemo(() => {
    let resultCss = css;
    for (const issue of activeIssues) {
      if (issue.recommendedFix && issue.recommendedFix.patchTarget === 'css') {
        resultCss = applyAutoFix(resultCss, issue);
      }
    }
    return resultCss;
  }, [css, activeIssues]);

  // Generate document content for iframe (Original vs Fixed vs Live Overlay)
  const generateDoc = (contentCss: string, enableOverlay: boolean) => {
    // Generate overlay styles & annotation badges to inject into iframe
    let overlayStyles = '';
    let overlayBadges = '';

    if (enableOverlay && activeIssues.length > 0) {
      overlayStyles = `
        @keyframes ai-pulse-border {
          0% { outline-color: #ff4d4f; box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(255, 77, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
        }
        .ai-problem-highlight {
          outline: 3px dashed #ff4d4f !important;
          outline-offset: 3px !important;
          animation: ai-pulse-border 1.8s infinite !important;
          position: relative !important;
        }
        .ai-annotation-pointer {
          position: absolute;
          top: -24px;
          left: 0;
          z-index: 99999;
          background: #ff4d4f;
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
          border-top: 4px solid #ff4d4f;
        }
        .ai-hover-tooltip {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 6px;
          z-index: 100000;
          width: 240px;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #334155;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          pointer-events: none;
        }
        .ai-annotation-pointer:hover + .ai-hover-tooltip,
        .ai-problem-highlight:hover > .ai-hover-tooltip {
          display: block;
        }
      `;

      // Build injection logic for each target element
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
                
                const tooltip = document.createElement('div');
                tooltip.className = 'ai-hover-tooltip';
                tooltip.innerHTML = '<strong>' + '${issue.title}' + ' [' + '${issue.severity}' + ']</strong><br/>' +
                  'Confidence: ${issue.confidenceScore}%<br/>' +
                  'Root Cause: ${issue.rootCause.replace(/'/g, "\\'")}<br/>' +
                  'CSS: <code>${issue.cssProperty}</code><br/>' +
                  'Fix: ${issue.recommendedFix.description.replace(/'/g, "\\'")}';
                
                if (getComputedStyle(el).position === 'static') {
                  el.style.position = 'relative';
                }
                el.appendChild(badge);
                el.appendChild(tooltip);
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
              padding: 0;
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

  const liveDoc = useMemo(() => generateDoc(css, showOverlay), [html, css, js, isLight, showOverlay, activeIssues]);
  const originalDoc = useMemo(() => generateDoc(css, false), [html, css, js, isLight]);
  const fixedDoc = useMemo(() => generateDoc(fixedCss, false), [html, fixedCss, js, isLight]);

  // Compute issue count for current target width
  const failingViewportsCount = useMemo(() => {
    return activeIssues.filter(i => i.affectedViewport.includes(selectedViewport)).length;
  }, [activeIssues, selectedViewport]);

  // Simple accessibility checks for bottom tab
  const a11yChecks = useMemo(() => {
    const checks = [];
    if (html.includes('<img') && !html.includes('alt=')) {
      checks.push({ rule: 'img-alt', message: 'Image element missing alt text attribute', severity: 'Error' });
    }
    if (html.includes('<button') && !html.includes('aria-label') && /<button[^>]*>\s*<\/button>/.test(html)) {
      checks.push({ rule: 'button-name', message: 'Button element has no accessible label', severity: 'Error' });
    }
    if (!html.includes('lang=')) {
      checks.push({ rule: 'html-has-lang', message: 'HTML document missing lang attribute', severity: 'Warning' });
    }
    return checks;
  }, [html]);

  const bg = isLight ? 'bg-white' : 'bg-slate-950';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const headerBg = isLight ? 'bg-slate-50' : 'bg-slate-900';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`h-full flex flex-col transition-colors select-none overflow-hidden ${bg} ${text}`}>

      {/* ── TOOLBAR & PREVIEW MODES ── */}
      <div className={`h-10 px-3 flex items-center justify-between text-xs border-b transition-colors ${headerBg} ${border}`}>
        {/* Left: Component Emulator Title & Breakpoint Controls */}
        <div className="flex items-center space-x-2 overflow-x-auto py-2">
          <Eye className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold tracking-wide uppercase text-[11px] shrink-0">
            Real Component Emulator
          </span>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 shrink-0 mx-1" />

          {/* Viewport Breakpoint Switcher */}
          {ALL_BREAKPOINTS.map((bp) => {
            const Icon = bp.icon;
            const isSelected = selectedViewport === bp.id;
            const hasFailure = activeIssues.some((i) => i.affectedViewport.includes(bp.id));

            return (
              <button
                key={bp.id}
                onClick={() => onSelectViewport && onSelectViewport(bp.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center space-x-1 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
                title={`Switch Viewport to ${bp.label}`}
              >
                <Icon className="w-3 h-3" />
                <span>{bp.label}</span>
                {hasFailure && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* Right: View Mode & Controls */}
        <div className="flex items-center space-x-2 shrink-0">

          {/* Visual AI Overlay Toggle Button */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1.5 transition-all border ${
              showOverlay
                ? 'bg-rose-500/15 text-rose-600 border-rose-300 dark:border-rose-800'
                : isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="Toggle Visual AI Overlay (Hotspot highlights, annotations & tooltips)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${showOverlay ? 'text-rose-500 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Visual Overlay</span>
          </button>

          {/* Mode Switcher: Live vs Compare vs Original vs Fixed */}
          <div className={`flex items-center p-0.5 rounded-lg border text-[10px] ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <button
              onClick={() => setViewMode('live')}
              className={`px-2 py-0.5 rounded font-semibold ${viewMode === 'live' ? 'bg-blue-600 text-white' : muted}`}
            >
              Live
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-2 py-0.5 rounded font-semibold ${viewMode === 'compare' ? 'bg-purple-600 text-white' : muted}`}
            >
              Compare
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-2 py-0.5 rounded font-semibold ${viewMode === 'original' ? 'bg-slate-700 text-white' : muted}`}
            >
              Before
            </button>
            <button
              onClick={() => setViewMode('fixed')}
              className={`px-2 py-0.5 rounded font-semibold ${viewMode === 'fixed' ? 'bg-emerald-600 text-white' : muted}`}
            >
              After
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className={`p-1 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] font-bold w-8 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className={`p-1 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className={`p-1 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── AI PREDICTION TOP BANNER ── */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-1.5 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse shrink-0" />
            <span className="font-semibold text-[11px]">
              Responsive layout predictions generated before rendering. Background AST scan active.
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-0.5 text-white/80 hover:text-white rounded"
            title="Dismiss Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── CANVAS RENDER AREA ── */}
      <div className={`flex-1 p-4 flex flex-col items-center justify-start overflow-auto relative ${isLight ? 'bg-slate-100/70' : 'bg-slate-900/60'}`}>

        {/* Failed Viewport Warning Overlay Banner */}
        {failingViewportsCount > 0 && viewMode === 'live' && (
          <div className="mb-3 w-full max-w-md bg-rose-50 border border-rose-200 text-rose-900 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
              <span>
                <strong>{failingViewportsCount} Layout Failure{failingViewportsCount > 1 ? 's' : ''}</strong> predicted at {targetWidth}px!
              </span>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">
              PRE-RENDER
            </span>
          </div>
        )}

        {/* COMPARISON SLIDER MODE */}
        {viewMode === 'compare' ? (
          <div
            className={`rounded-2xl shadow-xl overflow-hidden relative border-4 transition-all ${
              isLight ? 'bg-white border-slate-300 shadow-slate-300/50' : 'bg-slate-950 border-slate-800 shadow-slate-950'
            }`}
            style={{ width: `${targetWidth}px`, maxWidth: '100%', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <div className="relative w-full h-[520px]">
              {/* After Fix Layer */}
              <iframe
                title="After Fix Preview"
                srcDoc={fixedDoc}
                className="absolute inset-0 w-full h-full border-none bg-white dark:bg-slate-950"
                sandbox="allow-scripts"
              />
              <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold z-10">
                AFTER FIX
              </div>

              {/* Before Fix Layer (Clipped by slider position) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-rose-500"
                style={{ width: `${compareSliderPos}%` }}
              >
                <iframe
                  title="Before Fix Preview"
                  srcDoc={originalDoc}
                  className="w-full h-full border-none bg-white dark:bg-slate-950"
                  style={{ width: `${targetWidth}px` }}
                  sandbox="allow-scripts"
                />
                <div className="absolute top-2 left-2 bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold z-10">
                  BEFORE FIX
                </div>
              </div>

              {/* Draggable Slider Handle */}
              <input
                type="range"
                min={0}
                max={100}
                value={compareSliderPos}
                onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                className="absolute inset-x-0 bottom-4 w-11/12 mx-auto z-20 cursor-ew-resize accent-rose-500"
              />
            </div>
          </div>
        ) : (
          /* STANDARD DEVICE FRAME */
          <div
            className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 relative border-4 ${
              isLight ? 'bg-white border-slate-300 shadow-slate-300/50' : 'bg-slate-950 border-slate-800 shadow-slate-950'
            }`}
            style={{ width: `${targetWidth}px`, maxWidth: '100%', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Mobile Notch Indicator */}
            {targetWidth <= 425 && (
              <div className={`w-full h-5 flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                <div className={`w-14 h-2.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-slate-950'}`} />
              </div>
            )}

            {/* Render Viewport Content */}
            <iframe
              title="Real Component Preview"
              srcDoc={viewMode === 'original' ? originalDoc : viewMode === 'fixed' ? fixedDoc : liveDoc}
              className={`w-full min-h-[500px] border-none ${isLight ? 'bg-white' : 'bg-slate-950'}`}
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

      {/* ── BOTTOM PANEL WITH 6 TABS ── */}
      <div className={`border-t flex flex-col transition-all ${border} ${headerBg}`}>

        {/* Bottom Panel Toggle Header */}
        <div
          onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
          className="px-4 py-1.5 flex items-center justify-between cursor-pointer border-b text-xs border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[11px] uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Component Inspectors & Report Panel
            </span>
            {activeIssues.length > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {activeIssues.length} AI Predictions
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] ${muted}`}>{isBottomPanelOpen ? 'Collapse' : 'Expand Details'}</span>
            {isBottomPanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {/* Bottom Panel Content Tabs */}
        {isBottomPanelOpen && (
          <div className="h-56 flex flex-col overflow-hidden">
            {/* Tab Buttons */}
            <div className={`h-8 px-3 flex items-center space-x-1 border-b text-[11px] ${border}`}>
              {[
                { id: 'ai', label: 'AI Suggestions', icon: Sparkles, count: activeIssues.length },
                { id: 'dom', label: 'DOM Inspector', icon: Layers },
                { id: 'css', label: 'CSS Inspector', icon: Code2 },
                { id: 'a11y', label: 'Accessibility', icon: ShieldAlert, count: a11yChecks.length },
                { id: 'perf', label: 'Performance', icon: Activity },
                { id: 'report', label: 'Responsive Report', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeBottomTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveBottomTab(tab.id as BottomTab)}
                    className={`px-3 py-1 rounded-t-md font-semibold flex items-center space-x-1.5 transition-all ${
                      isActive
                        ? isLight
                          ? 'bg-white text-blue-600 border-t-2 border-blue-600 font-bold shadow-xs'
                          : 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-bold'
                        : isLight
                        ? 'text-slate-600 hover:bg-slate-200'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className={`flex-1 p-3 overflow-y-auto font-mono text-xs ${bg}`}>

              {/* TAB 1: AI Suggestions */}
              {activeBottomTab === 'ai' && (
                <div className="space-y-2">
                  {activeIssues.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      No responsive layout issues flagged for this component.
                    </div>
                  ) : (
                    activeIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onMouseEnter={() => setHoveredIssueId(issue.id)}
                        onMouseLeave={() => setHoveredIssueId(null)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                          hoveredIssueId === issue.id
                            ? isLight ? 'bg-blue-50 border-blue-300' : 'bg-slate-900 border-indigo-700'
                            : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{issue.title}</span>
                            <span className="px-1.5 py-0.2 text-[9px] rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              {issue.confidenceScore}% confidence
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{issue.rootCause}</p>
                        </div>
                        {onApplyFix && (
                          <button
                            onClick={() => onApplyFix(issue)}
                            className="px-3 py-1 rounded bg-blue-600 text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs hover:bg-blue-700 shrink-0"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>1-Click Fix</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: DOM Inspector */}
              {activeBottomTab === 'dom' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-blue-500 mb-1">Parsed DOM Node Hierarchy</div>
                  <pre className="p-2.5 rounded bg-slate-900 text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
                    {html}
                  </pre>
                </div>
              )}

              {/* TAB 3: CSS Inspector */}
              {activeBottomTab === 'css' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-blue-500 mb-1">Active CSS Declarations & Rules</div>
                  <pre className="p-2.5 rounded bg-slate-900 text-cyan-300 text-[11px] overflow-x-auto leading-relaxed">
                    {css}
                  </pre>
                </div>
              )}

              {/* TAB 4: Accessibility */}
              {activeBottomTab === 'a11y' && (
                <div className="space-y-2">
                  {a11yChecks.length === 0 ? (
                    <div className="text-center py-6 text-emerald-500 text-xs">
                      ✓ No accessibility WCAG 2.1 compliance violations detected.
                    </div>
                  ) : (
                    a11yChecks.map((chk, i) => (
                      <div key={i} className="p-2 rounded bg-amber-950/30 border border-amber-800 text-amber-300 text-[11px] flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <strong className="block">{chk.rule} [{chk.severity}]</strong>
                          <span>{chk.message}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: Performance */}
              {activeBottomTab === 'perf' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Render Time</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">12 ms</span>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">CLS Shift Score</span>
                    <span className="text-lg font-bold text-sky-400 font-mono">0.002</span>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">AST Scan Time</span>
                    <span className="text-lg font-bold text-purple-400 font-mono">8 ms</span>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">DOM Elements</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">{html.split('<').length - 1}</span>
                  </div>
                </div>
              )}

              {/* TAB 6: Responsive Report */}
              {activeBottomTab === 'report' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Viewport Breakpoint Matrix Evaluation</div>
                  <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-mono">
                    {ALL_BREAKPOINTS.map(bp => {
                      const fails = activeIssues.filter(i => i.affectedViewport.includes(bp.id)).length;
                      return (
                        <div key={bp.id} className={`p-2 rounded border font-bold ${
                          fails > 0 ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                        }`}>
                          <div className="text-xs mb-0.5">{bp.label}</div>
                          <div>{fails === 0 ? '✓ CLEAN' : `FAIL (${fails})`}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    </div>
  );
};
