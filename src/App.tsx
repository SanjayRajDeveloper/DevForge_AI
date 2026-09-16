import { useState, useEffect, useCallback, useRef } from 'react';
import { HomePage } from './components/HomePage';
import { WorkspacesPage } from './components/WorkspacesPage';
import { ApiTesterPage } from './components/ApiTesterPage';
import type { HomeAction } from './components/workspaceActions';
import { EditorPanel } from './components/EditorPanel';
import { AIDiagnosticsPage } from './components/AIDiagnosticsPage';
import { Playground } from './playground/Playground';
import { OutputWorkspace } from './components/OutputWorkspace';

import { IEEE_TEST_CASES } from './engine/testSuites/testCases';
import type { LayoutIssue } from './types';
import { parseHTML } from './engine/analyzer/htmlParser';
import { parseCSS } from './engine/analyzer/cssParser';
import { runAIPrediction } from './engine/ai/mlPredictor';
import { applyAutoFix } from './engine/recommendations/recommendationEngine';
import { Home } from 'lucide-react';

type AppMode = 'home' | 'ide' | 'playground' | 'output-workspace' | 'ai-diagnostics' | 'workspaces' | 'api-tester';

export function App() {
  const [appMode, setAppMode] = useState<AppMode>('home');
  const [playgroundView, setPlaygroundView] = useState<'editor' | 'workspace'>('editor');

  const [theme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('smartlayout_theme') as 'light' | 'dark') || 'light';
  });

  const [html, setHtml] = useState<string>(IEEE_TEST_CASES[0].html);
  const [css, setCss] = useState<string>(IEEE_TEST_CASES[0].css);
  const [js, setJs] = useState<string>(IEEE_TEST_CASES[0].js || '// Custom JS logic\n');

  const [issues, setIssues] = useState<LayoutIssue[]>([]);
  const [healthScore, setHealthScore] = useState<number>(100);
  const [, setIsAuditing] = useState<boolean>(false);
  const [, setPredictionTimeMs] = useState<number>(14);

  // Issues whose fixes have been applied (hidden from AI Findings until code is edited again)
  const resolvedIssueIdsRef = useRef<Set<string>>(new Set());

  // Update HTML root theme class
  useEffect(() => {
    localStorage.setItem('smartlayout_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleHomeNavigate = (mode: HomeAction) => {
    if (mode === 'playground-workspace') {
      setAppMode('playground');
      setPlaygroundView('workspace');
    } else {
      setAppMode(mode);
    }
  };

  const runAudit = useCallback(() => {
    setIsAuditing(true);
    const htmlResult = parseHTML(html);
    const htmlClasses = htmlResult.allNodes.flatMap(n => n.classes);
    const htmlIds = htmlResult.allNodes.map(n => n.id).filter(Boolean);
    const cssResult = parseCSS(css, htmlClasses, htmlIds);
    const auditResult = runAIPrediction(html, css, htmlResult.allNodes, cssResult.rules);

    // Hide issues whose AI fixes have already been applied
    const filteredIssues = auditResult.issues.filter(i => !resolvedIssueIdsRef.current.has(i.id));
    setIssues(filteredIssues);

    // Recompute health score from the remaining (unresolved) issues
    const highCount = filteredIssues.filter(i => i.severity === 'High').length;
    const medCount = filteredIssues.filter(i => i.severity === 'Medium').length;
    const lowCount = filteredIssues.filter(i => i.severity === 'Low').length;
    setHealthScore(Math.max(0, 100 - (highCount * 25 + medCount * 12 + lowCount * 5)));
    setPredictionTimeMs(auditResult.predictionTimeMs);
    setIsAuditing(false);
  }, [html, css]);

  useEffect(() => {
    const timer = setTimeout(() => runAudit(), 300);
    return () => clearTimeout(timer);
  }, [html, css, runAudit]);

  const handleApplyFix = (issue: LayoutIssue) => {
    resolvedIssueIdsRef.current.add(issue.id);
    if (issue.recommendedFix.patchTarget === 'css') setCss(applyAutoFix(css, issue));
    else setHtml(applyAutoFix(html, issue));
  };

  // Apply every detected issue's fix at once, then clear AI Findings
  const handleApplyAllFixes = useCallback(() => {
    let nextCss = css;
    let nextHtml = html;
    issues.forEach(issue => {
      resolvedIssueIdsRef.current.add(issue.id);
      if (issue.recommendedFix.patchTarget === 'css') nextCss = applyAutoFix(nextCss, issue);
      else nextHtml = applyAutoFix(nextHtml, issue);
    });
    setCss(nextCss);
    setHtml(nextHtml);
    setIssues([]);
    setHealthScore(100);
  }, [css, html, issues]);

  // Manual code edits reset resolution so re-introduced bugs surface again
  const handleHtmlChange = (value: string) => { resolvedIssueIdsRef.current = new Set(); setHtml(value); };
  const handleCssChange = (value: string) => { resolvedIssueIdsRef.current = new Set(); setCss(value); };

  const isLight = theme === 'light';

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>

      {/* ── Page Transitions (remount on mode switch replays entrance animation) ── */}
      <div key={appMode} className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* ── Home Dashboard ── */}
      {appMode === 'home' && (
        <HomePage
          theme={theme}
          onNavigate={handleHomeNavigate}
        />
      )}

      {/* ── Workspaces Hub ── */}
      {appMode === 'workspaces' && (
        <WorkspacesPage
          theme={theme}
          onNavigate={handleHomeNavigate}
        />
      )}

      {/* ── API Endpoint Tester ── */}
      {appMode === 'api-tester' && (
        <div className="flex-1 overflow-hidden animate-slide-in-left">
          <ApiTesterPage
            theme={theme}
            onBack={() => setAppMode('home')}
            onOpenWorkspaces={() => setAppMode('workspaces')}
          />
        </div>
      )}

      {/* ── IDE Mode ── */}
      {appMode === 'ide' && (
        <main className="flex-1 grid grid-cols-1 overflow-hidden">
          <div className="h-full overflow-hidden animate-slide-in-left">
            <EditorPanel
              html={html}
              css={css}
              js={js}
              onHtmlChange={handleHtmlChange}
              onCssChange={handleCssChange}
              onJsChange={setJs}
              activeIssues={issues}
              onApplyFix={handleApplyFix}
              theme={theme}
              onOpenOutputWorkspace={() => setAppMode('output-workspace')}
              onOpenWorkspaces={() => setAppMode('workspaces')}
            />
          </div>
        </main>
      )}

      {/* ── Explainable AI Diagnostics Mode ── */}
      {appMode === 'ai-diagnostics' && (
        <div className="flex-1 overflow-hidden animate-slide-in-left">
          <AIDiagnosticsPage
            issues={issues}
            html={html}
            css={css}
            onApplyFix={handleApplyFix}
            onBack={() => setAppMode('output-workspace')}
            theme={theme}
          />
        </div>
      )}

      {/* ── Component Playground Mode ── */}
      {appMode === 'playground' && (
        <div className="flex-1 overflow-hidden">
          <Playground
            theme={theme}
            view={playgroundView}
            onViewChange={setPlaygroundView}
            onOpenWorkspaces={() => setAppMode('workspaces')}
          />
        </div>
      )}

      {/* ── Output Workspace Mode ── */}
      {appMode === 'output-workspace' && (
        <div className="flex-1 overflow-hidden">
          <OutputWorkspace
            html={html}
            css={css}
            js={js}
            issues={issues}
            healthScore={healthScore}
            theme={theme}
            onApplyFix={handleApplyFix}
            onApplyAllFixes={handleApplyAllFixes}
            onOpenAIDiagnostics={() => setAppMode('ai-diagnostics')}
            onClose={() => setAppMode('ide')}
            onOpenWorkspaces={() => setAppMode('workspaces')}
          />
        </div>
      )}

      {/* ── Floating Home shortcut (only off the home page) ── */}
      {appMode !== 'home' && (
        <button
          onClick={() => setAppMode('home')}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full border shadow-lg transition-all hover:scale-110 active:scale-95 bg-slate-900/80 text-cyan-200 border-cyan-400/30 hover:bg-slate-800 backdrop-blur-sm"
          title="Back to Home"
        >
          <Home className="w-4 h-4" />
        </button>
      )}
      </div>
    </div>
  );
}

export default App;
