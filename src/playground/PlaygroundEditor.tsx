import Editor from '@monaco-editor/react';
import { FileCode, Code2 } from 'lucide-react';

interface PlaygroundEditorProps {
  jsxCode: string;
  cssCode: string;
  editorTab: 'jsx' | 'css';
  onEditorTabChange: (tab: 'jsx' | 'css') => void;
  onJsxChange: (val: string) => void;
  onCssChange: (val: string) => void;
  selectedCompName: string;
  theme: 'light' | 'dark';
}

export function PlaygroundEditor({
  jsxCode, cssCode, editorTab, onEditorTabChange,
  onJsxChange, onCssChange, selectedCompName, theme
}: PlaygroundEditorProps) {
  const isLight = theme === 'light';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const panelBg = isLight ? 'bg-slate-50' : 'bg-slate-900';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';
  const hoverBg = isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800';

  return (
    <div className={`flex-1 flex flex-col ${border} overflow-hidden`}>
      <div className={`h-12 flex items-center justify-between border-b ${border} ${panelBg} px-2 text-xs select-none`}>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditorTabChange('jsx')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] flex items-center space-x-1.5 transition-all ${
              editorTab === 'jsx'
                ? isLight ? 'bg-white text-purple-700 border-t-2 border-purple-600 font-bold shadow-xs' : 'bg-slate-950 text-purple-400 border-t-2 border-purple-500 font-bold'
                : `${muted} ${hoverBg}`
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-orange-500" />
            <span>{selectedCompName}.jsx</span>
          </button>
          <button
            onClick={() => onEditorTabChange('css')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] flex items-center space-x-1.5 transition-all ${
              editorTab === 'css'
                ? isLight ? 'bg-white text-purple-700 border-t-2 border-purple-600 font-bold shadow-xs' : 'bg-slate-950 text-purple-400 border-t-2 border-purple-500 font-bold'
                : `${muted} ${hoverBg}`
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-sky-500" />
            <span>component.css</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={editorTab === 'jsx' ? 'javascript' : 'css'}
          theme={isLight ? 'vs' : 'vs-dark'}
          value={editorTab === 'jsx' ? jsxCode : cssCode}
          onChange={val => { if (editorTab === 'jsx') onJsxChange(val || ''); else onCssChange(val || ''); }}
          options={{
            fontSize: 12.5,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            fontFamily: "'Fira Code','Consolas',monospace",
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false
          }}
        />
      </div>
    </div>
  );
}