import React from 'react';
import { CheckCircle2, Wand2 } from 'lucide-react';
import type { LayoutIssue } from '../../types';

interface AIDiagnosticsPanelProps {
  issues: LayoutIssue[];
  html: string;
  css: string;
  onApplyFix: (issue: LayoutIssue) => void;
  theme: 'light' | 'dark';
}

const SEVERITY_ICONS: Record<string, string> = {
  Critical: '🔴',
  High: '🟠',
  Medium: '🟡',
  Low: '🔵'
};

function extractElement(html: string, selector: string): string | null {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const el = doc.querySelector(selector);
    if (!el) return null;
    const tag = el.tagName.toLowerCase();
    if (tag === 'html' || tag === 'body') return null;
    return el.outerHTML;
  } catch {
    return null;
  }
}

const LiveMiniPreview: React.FC<{ css: string; elementHtml: string; selector: string; isLight: boolean }> = ({
  css,
  elementHtml,
  selector,
  isLight
}) => {
  const srcDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; }
      body { background: transparent; padding: 10px; }
      ${css}
      ${selector} {
        outline: 3px dashed #f43f5e !important;
        outline-offset: 3px !important;
        animation: ai-err-pulse 1.8s infinite;
      }
      @keyframes ai-err-pulse {
        0%, 100% { outline-color: #f43f5e; }
        50% { outline-color: #fb7185; }
      }
    </style>
  </head>
  <body>${elementHtml}</body>
</html>`;

  return (
    <div className={`relative h-36 overflow-hidden rounded-lg border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/60 border-slate-700'}`}>
      <div className="flex justify-center h-full">
        <iframe title="Live error UI preview" srcDoc={srcDoc} sandbox="" className="h-full w-full border-none" />
      </div>
      <div className="absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-bold shadow">
        Real element from your code →
      </div>
    </div>
  );
};

const RED_OUTLINE = { outline: '2px dashed #f43f5e', outlineOffset: '2px' } as const;

const MiniErrorPreview: React.FC<{ issue: LayoutIssue; isLight: boolean }> = ({ issue, isLight }) => {
  const frameCls = `relative w-full h-28 overflow-hidden rounded-lg border ${
    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/60 border-slate-700'
  }`;
  const chip = `absolute top-1 right-1 z-10 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-bold shadow`;
  const lineCls = `h-2 rounded ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`;
  const el = issue.affectedElement;
  const title = issue.title;

  // Navbar that exceeds the page width (looks like an extended box)
  if (title === 'Navbar Collapse' || (title === 'Horizontal Overflow' && el.includes('nav'))) {
    return (
      <div className={frameCls}>
        <div
          className="mt-3 h-8 bg-slate-700 rounded-md flex items-center justify-between px-3"
          style={{ width: '135%', ...RED_OUTLINE }}
        >
          <span className="bg-cyan-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded">Logo</span>
          <div className="flex gap-2 text-[9px] font-semibold text-white">
            <span>Home</span><span>Features</span><span>Pricing</span><span>Contact</span>
          </div>
          <span className="text-[9px] text-white">☰</span>
        </div>
        <span className={chip}>Navbar exceeds page →</span>
        <div className="mx-2 mt-2.5 space-y-1.5">
          <div className={lineCls} style={{ width: '55%' }} />
          <div className={lineCls} style={{ width: '80%' }} />
          <div className={lineCls} style={{ width: '65%' }} />
        </div>
      </div>
    );
  }

  // Button that overflows the screen
  if (title === 'Button Overflow' || (title === 'Horizontal Overflow' && el.includes('btn'))) {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 space-y-1.5">
          <div className={lineCls} style={{ width: '70%' }} />
          <div className={lineCls} style={{ width: '45%' }} />
        </div>
        <div className="mx-3 mt-4">
          <div
            className="h-7 rounded-md bg-indigo-500 flex items-center justify-center text-white text-[9px] font-bold"
            style={{ width: '150%', ...RED_OUTLINE }}
          >
            Start Free 30-Day Trial
          </div>
        </div>
        <span className={chip}>Button exceeds page →</span>
      </div>
    );
  }

  // Fixed grid tracks wider than the screen
  if (title === 'Broken Grid') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 space-y-1.5">
          <div className={lineCls} style={{ width: '50%' }} />
          <div className={lineCls} style={{ width: '35%' }} />
        </div>
        <div className="mt-3" style={{ width: '160%', ...RED_OUTLINE }}>
          <div className="flex gap-1.5 px-3">
            {[0, 1, 2].map(i => (
              <div key={i} className={`flex-1 h-12 rounded-md ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>
        <span className={chip}>Grid wider than screen →</span>
      </div>
    );
  }

  // Flex row that refuses to wrap
  if (title === 'Broken Flexbox') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 space-y-1.5">
          <div className={lineCls} style={{ width: '60%' }} />
          <div className={lineCls} style={{ width: '40%' }} />
        </div>
        <div className="mt-3" style={{ width: '150%', ...RED_OUTLINE }}>
          <div className="flex px-3 gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`h-10 w-14 shrink-0 rounded-md ${isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
            ))}
          </div>
        </div>
        <span className={chip}>Items squeezed in one row →</span>
      </div>
    );
  }

  // Image overflowing its container
  if (title === 'Image Overflow' || title === 'Layout Shift') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 space-y-1.5">
          <div className={lineCls} style={{ width: '55%' }} />
        </div>
        <div className="mt-2 mx-3">
          <div
            className="h-10 rounded-md flex items-center justify-center bg-gradient-to-r from-indigo-400 to-cyan-300 text-[9px] font-bold text-slate-800"
            style={{ width: '140%', ...(title === 'Image Overflow' ? RED_OUTLINE : { border: '2px dashed #94a3b8' }) }}
          >
            {title === 'Image Overflow' ? 'Image full size → overflows' : 'Image loads late → content jumps'}
          </div>
        </div>
        <span className={chip}>{title === 'Image Overflow' ? 'Image exceeds container →' : 'Content shifts when image loads'}</span>
      </div>
    );
  }

  // Text forced onto a single line
  if (title === 'Text Overflow') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3">
          <div
            className="px-2 py-1.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-semibold"
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', ...RED_OUTLINE }}
          >
            MAINTENANCE WINDOW: Scheduled platform upgrade begins at 02:00 UTC — plan your deployments accordingly!
          </div>
        </div>
        <span className={chip}>Text overflows box →</span>
      </div>
    );
  }

  // Overlapping / colliding boxes
  if (title === 'Negative Margin Collision' || title === 'Element Collision' || title === 'Z-index Conflict' || title === 'Absolute Position Conflict') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 space-y-1.5">
          <div className={lineCls} style={{ width: '70%' }} />
          <div className={lineCls} style={{ width: '50%' }} />
        </div>
        <div className="mt-3 mx-6 relative">
          <div className={`h-9 rounded-md ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`} />
          <div
            className="absolute top-0 left-6 h-9 w-2/3 rounded-md flex items-center justify-center text-white text-[9px] font-bold bg-rose-500/80"
            style={{ ...RED_OUTLINE }}
          >
            Overlaps sibling
          </div>
        </div>
        <span className={chip}>Boxes overlap →</span>
      </div>
    );
  }

  // Hidden off-screen component
  if (title === 'Hidden Components') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 space-y-1.5">
          <div className={lineCls} style={{ width: '60%' }} />
          <div className={lineCls} style={{ width: '80%' }} />
        </div>
        <div
          className="absolute top-10 left-0 h-8 w-16 rounded-md flex items-center justify-center text-white text-[8px] font-bold bg-slate-600"
          style={{ transform: 'translateX(-35%)', ...RED_OUTLINE }}
        >
          Element
        </div>
        <span className={chip}>Element off-screen →</span>
      </div>
    );
  }

  // Image missing alt text
  if (title === 'Accessibility Issues') {
    return (
      <div className={frameCls}>
        <div className="mx-3 mt-3 flex items-center gap-2">
          <div
            className="h-10 w-16 rounded-md bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[14px]"
            style={{ ...RED_OUTLINE }}
          >
            🖼️
          </div>
          <div className="space-y-1.5 flex-1">
            <div className={lineCls} style={{ width: '80%' }} />
            <div className={lineCls} style={{ width: '55%' }} />
          </div>
        </div>
        <span className={chip}>Missing alt text</span>
      </div>
    );
  }

  // Missing media queries — layout never adapts
  if (title === 'Missing Media Queries') {
    return (
      <div className={frameCls}>
        <div className="mt-3 h-7 bg-slate-700 rounded-md flex items-center justify-between px-3 mx-3">
          <span className="bg-cyan-400 text-slate-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded">Logo</span>
          <div className="flex gap-1.5 text-[8px] font-semibold text-white">
            <span>Home</span><span>Features</span><span>Pricing</span><span>Contact</span>
          </div>
        </div>
        <div className="mx-3 mt-2 flex gap-1.5" style={{ width: '130%', ...RED_OUTLINE }}>
          {[0, 1, 2].map(i => (
            <div key={i} className={`flex-1 h-10 rounded-md ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`} />
          ))}
        </div>
        <span className={chip}>Layout never adapts →</span>
      </div>
    );
  }

  // Generic overflow: element exceeds the page
  return (
    <div className={frameCls}>
      <div className="mx-3 mt-3 space-y-1.5">
        <div className={lineCls} style={{ width: '60%' }} />
        <div className={lineCls} style={{ width: '75%' }} />
      </div>
      <div className="mx-3 mt-3">
        <div
          className="h-8 rounded-md bg-slate-500/70 flex items-center justify-center text-[9px] font-bold text-white"
          style={{ width: '150%', ...RED_OUTLINE }}
        >
          {el} — too wide for the page
        </div>
      </div>
      <span className={chip}>Exceeds page width →</span>
    </div>
  );
};

export const AIDiagnosticsPanel: React.FC<AIDiagnosticsPanelProps> = ({
  issues,
  html,
  css,
  onApplyFix,
  theme
}) => {
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white' : 'bg-slate-950';
  const text = isLight ? 'text-slate-900' : 'text-slate-100';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`h-full flex flex-col overflow-hidden ${bg} ${text}`}>

      {issues.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center p-6">
          <div className={`w-14 h-14 rounded-full border flex items-center justify-center ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/50 border-emerald-800'}`}>
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${text}`}>No Errors Detected</h3>
            <p className={`text-xs mt-1 ${muted}`}>Zero responsive layout failures found in the current code.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {issues.map(issue => {
            const sampleEl = extractElement(html, issue.affectedElement);
            return (
            <div
              key={issue.id}
              className={`rounded-xl border p-3 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base leading-none shrink-0">{SEVERITY_ICONS[issue.severity] || '🔴'}</span>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className={`font-bold text-xs truncate ${text}`}>{issue.title}</h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                      issue.severity === 'Critical' || issue.severity === 'High'
                        ? isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950 text-rose-300 border-rose-800'
                        : isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <div className={`text-[10px] font-mono truncate ${muted}`}>
                    {issue.file.toUpperCase()} · Line {issue.lineStart} · {issue.affectedElement} · {issue.confidenceScore}% confidence
                  </div>
                </div>

                <button
                  onClick={() => onApplyFix(issue)}
                  className="shrink-0 px-3.5 py-2 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition-all active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30"
                  title="Apply the AI recommended fix for this error"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Apply Fix</span>
                </button>
              </div>

              <p className={`mt-2 text-[11px] leading-relaxed ${muted}`}>
                {issue.shortDescription || issue.rootCause}
              </p>

              <div className="mt-2.5">
                {sampleEl ? (
                  <LiveMiniPreview
                    css={css}
                    elementHtml={sampleEl}
                    selector={issue.affectedElement}
                    isLight={isLight}
                  />
                ) : (
                  <MiniErrorPreview issue={issue} isLight={isLight} />
                )}
              </div>

              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`rounded-lg border overflow-hidden ${isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/40 border-rose-900/60'}`}>
                  <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-b ${isLight ? 'text-rose-600 border-rose-200' : 'text-rose-300 border-rose-900/60'}`}>
                    Before Fix (Broken Code)
                  </div>
                  <pre className={`px-2 py-1.5 text-[10px] font-mono whitespace-pre-wrap break-all ${isLight ? 'text-rose-700' : 'text-rose-200'}`}>
                    {issue.recommendedFix?.originalSnippet || '—'}
                  </pre>
                </div>
                <div className={`rounded-lg border overflow-hidden ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/40 border-emerald-900/60'}`}>
                  <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${isLight ? 'text-emerald-600 border-emerald-200' : 'text-emerald-300 border-emerald-900/60'}`}>
                    <span>Suggested Correct Code</span>
                    {issue.recommendedFix && (
                      <span className="font-semibold normal-case">↑ replaces ↓</span>
                    )}
                  </div>
                  <pre className={`px-2 py-1.5 text-[10px] font-mono whitespace-pre-wrap break-all ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                    {issue.recommendedFix?.replacementSnippet || '—'}
                  </pre>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
