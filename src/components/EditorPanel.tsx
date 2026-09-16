import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { Code2, FileCode, FileType, AlertTriangle, MonitorPlay, PanelsTopLeft } from 'lucide-react';
import type { LayoutIssue } from '../types';

interface EditorPanelProps {
  html: string;
  css: string;
  js: string;
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  onJsChange: (val: string) => void;
  activeIssues: LayoutIssue[];
  onApplyFix?: (issue: LayoutIssue) => void;
  theme: 'light' | 'dark';
  onOpenOutputWorkspace?: () => void;
  onOpenWorkspaces?: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  html,
  css,
  js,
  onHtmlChange,
  onCssChange,
  onJsChange,
  activeIssues,
  onApplyFix,
  theme,
  onOpenOutputWorkspace,
  onOpenWorkspaces
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decoRef = useRef<any>(null);
  const decoIdsRef = useRef<string[]>([]);

  const isLight = theme === 'light';

  const getActiveCode = () => {
    switch (activeTab) {
      case 'html':
        return html;
      case 'css':
        return css;
      case 'js':
        return js;
    }
  };

  const handleCodeChange = (val?: string) => {
    const cleanVal = val || '';
    if (activeTab === 'html') onHtmlChange(cleanVal);
    else if (activeTab === 'css') onCssChange(cleanVal);
    else onJsChange(cleanVal);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register Lightbulb Quick Fix CodeAction Provider
    monaco.languages.registerCodeActionProvider('css', {
      provideCodeActions: (model: any, _range: any, context: any) => {
        const actions: any[] = [];

        for (const marker of context.markers) {
          if (marker.source === 'SmartLayout AI Predictor') {
            const matchingIssue = activeIssues.find(
              (i) => i.lineStart === marker.startLineNumber
            );

            if (matchingIssue) {
              actions.push({
                title: `💡 SmartLayout AI Quick Fix: ${matchingIssue.recommendedFix.description}`,
                diagnostics: [marker],
                kind: 'quickfix',
                isPreferred: true,
                edit: {
                  edits: [
                    {
                      resource: model.uri,
                      textEdit: {
                        range: {
                          startLineNumber: marker.startLineNumber,
                          startColumn: 1,
                          endLineNumber: marker.startLineNumber,
                          endColumn: 200
                        },
                        text: matchingIssue.recommendedFix.replacementSnippet
                      }
                    }
                  ]
                }
              });
            }
          }
        }

        return {
          actions,
          dispose: () => {}
        };
      }
    });
  };

  // Sync AI Markers to Monaco Diagnostics in real-time
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();

    if (!model) return;

    // Filter issues matching current tab
    const filteredIssues = activeIssues.filter(
      (issue) => issue.file === activeTab || (activeTab === 'css' && issue.file === 'css')
    );

    const glyphFor = (s: string) =>
      s === 'Critical' || s === 'High' ? 'sl-glyph-error' : s === 'Medium' ? 'sl-glyph-warn' : 'sl-glyph-info';
    const lineFor = (s: string) =>
      s === 'Critical' || s === 'High' ? 'sl-line-error' : s === 'Medium' ? 'sl-line-warn' : 'sl-line-info';

    const markers: any[] = [];
    const decorations: any[] = [];

    for (const issue of filteredIssues) {
      const severity =
        issue.severity === 'Critical' || issue.severity === 'High'
          ? monaco.MarkerSeverity.Error
          : issue.severity === 'Medium'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info;

      const icon = issue.severity === 'Critical' ? '🔴' : issue.severity === 'High' ? '🟠' : '🟡';

      const hoverMarkdown = [
        `### ${icon} AI Layout Warning: **${issue.title}**`,
        `**Confidence:** \`${issue.confidenceScore}%\` | **Severity:** \`${issue.severity}\``,
        `---`,
        `**Root Cause:** ${issue.rootCause}`,
        `**Affected CSS Property:** \`${issue.cssProperty}\``,
        `**Recommended Fix:** \`${issue.recommendedFix.description}\``,
        `---`,
        `💡 *Click lightbulb icon or press Ctrl+. to apply Quick Fix*`
      ].join('\n\n');

      markers.push({
        startLineNumber: issue.lineStart,
        startColumn: 1,
        endLineNumber: issue.lineStart,
        endColumn: 100,
        message: hoverMarkdown,
        severity,
        source: 'SmartLayout AI Predictor'
      });

      decorations.push({
        range: new monaco.Range(issue.lineStart, 1, issue.lineStart, 1),
        options: {
          isWholeLine: true,
          className: lineFor(issue.severity),
          glyphMarginClassName: glyphFor(issue.severity),
          glyphMarginHoverMessage: { value: hoverMarkdown },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      });
    }

    monaco.editor.setModelMarkers(model, 'smartlayout-ai', markers);

    if (typeof editorRef.current.createDecorationsCollection === 'function') {
      if (!decoRef.current) decoRef.current = editorRef.current.createDecorationsCollection();
      decoRef.current.set(decorations);
    } else {
      decoIdsRef.current = editorRef.current.deltaDecorations(decoIdsRef.current, decorations);
    }
  }, [activeIssues, activeTab]);

  return (
    <div
      className={`h-full flex flex-col border-r transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}
    >
      {/* Editor Tab Navigation Header */}
      <div
        className={`h-14 px-3 flex items-center justify-between text-xs select-none border-b transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-1">
          {onOpenWorkspaces && (
            <button
              onClick={onOpenWorkspaces}
              className={`mr-1 px-3.5 py-2 rounded-md text-[10px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-indigo-300'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-indigo-500/60'
              }`}
              title="Back to Workspaces"
            >
              <PanelsTopLeft className="w-3.5 h-3.5" />
              <span>Back to Workspaces</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('html')}
            className={`px-4 py-2 rounded-t-md font-mono text-sm font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'html'
                ? isLight
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 font-semibold shadow-sm'
                  : 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-semibold'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-orange-500" />
            <span>index.html</span>
          </button>

          <button
            onClick={() => setActiveTab('css')}
            className={`px-4 py-2 rounded-t-md font-mono text-sm font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'css'
                ? isLight
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 font-semibold shadow-sm'
                  : 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-semibold'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileType className="w-3.5 h-3.5 text-sky-500" />
            <span>styles.css</span>
            {activeIssues.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full border text-[10px] font-bold flex items-center gap-1 ${
                  isLight
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                {activeIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('js')}
            className={`px-4 py-2 rounded-t-md font-mono text-sm font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'js'
                ? isLight
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600 font-semibold shadow-sm'
                  : 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 font-semibold'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-yellow-500" />
            <span>main.js</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {onOpenOutputWorkspace && (
            <button
              onClick={onOpenOutputWorkspace}
              className="px-4 py-2.5 text-[10px] font-bold rounded-lg text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xs flex items-center gap-1.5 border-none cursor-pointer active:scale-95"
              title="Open the rendered application in the Output Workspace."
            >
              <MonitorPlay className="w-3 h-3" />
              <span>Open Output Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language={activeTab}
          theme={isLight ? 'vs' : 'vs-dark'}
          value={getActiveCode()}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            lineNumbersMinChars: 3,
            glyphMargin: true,
            fontFamily: "'Fira Code', 'Consolas', monospace",
            renderLineHighlight: 'all',
            hover: { enabled: true as any, delay: 150 }
          }}
        />
      </div>

      {/* Quick fix indicator if onApplyFix provided */}
      {onApplyFix && activeIssues.length > 0 && (
        <div className="hidden">
          {/* Preserved callback hook */}
        </div>
      )}
    </div>
  );
};
