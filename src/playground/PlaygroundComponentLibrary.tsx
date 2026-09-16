import { useState } from 'react';
import { X, Plus, Trash2, Save, AlertTriangle, FlaskConical, Sparkles, Wand2 } from 'lucide-react';
import type { PlaygroundComponent } from './playgroundTypes';
import { generateFromPrompt } from './promptGenerator';

interface PlaygroundComponentLibraryProps {
  theme: 'light' | 'dark';
  customComponents: PlaygroundComponent[];
  isOpen: boolean;
  onClose: () => void;
  onAdd: (comp: PlaygroundComponent) => void;
  onRemove: (id: string) => void;
}

const inputBase = (isLight: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
    isLight
      ? 'bg-white border-slate-200 text-slate-800 focus:border-purple-400'
      : 'bg-slate-950 border-slate-700 text-slate-200 focus:border-purple-500'
  }`;

export function PlaygroundComponentLibrary({
  theme, customComponents, isOpen, onClose, onAdd, onRemove
}: PlaygroundComponentLibraryProps) {
  const isLight = theme === 'light';

  const [name, setName] = useState('');
  const [jsxCode, setJsxCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [propsJson, setPropsJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateFromPrompt = () => {
    if (!prompt.trim()) {
      setError('Enter a prompt describing the component you want, e.g. "a pricing card with a gradient border".');
      return;
    }
    setIsGenerating(true);
    setError(null);

    // Heuristic "AI" builder — turns a plain-language prompt into a working component.
    setTimeout(() => {
      const comp = generateFromPrompt(prompt);
      if (comp) onAdd(comp);
      setPrompt('');
      setIsGenerating(false);
    }, 350);
  };

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmedName)) {
      setError('Component name must be a valid identifier, e.g. MyCard.');
      return;
    }
    if (!jsxCode.trim().includes(`function ${trimmedName}`)) {
      setError(`JSX code must define "function ${trimmedName}(...)" so it can be rendered.`);
      return;
    }
    let parsedProps: string;
    try {
      const parsed = JSON.parse(propsJson.trim() || '{}');
      parsedProps = JSON.stringify(parsed, null, 2);
    } catch (e: any) {
      setError(`Props JSON is invalid: ${e?.message || e}`);
      return;
    }

    onAdd({
      id: `custom-${Date.now()}`,
      name: trimmedName,
      code: jsxCode.trim(),
      css: cssCode.trim(),
      propsJson: parsedProps,
      isCustom: true,
    });

    setName('');
    setJsxCode('');
    setCssCode('');
    setPropsJson('{}');
    setError(null);
  };

  const panelBg = isLight ? 'bg-white' : 'bg-slate-900';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${panelBg} ${border}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b ${border} ${panelBg}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-xs">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Custom Component Library</h2>
              <p className={`text-[11px] ${muted}`}>Paste your own React components into the playground</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'}`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* AI Prompt generator */}
          <section
            className={`rounded-xl border p-4 ${isLight ? 'bg-purple-50/60 border-purple-200' : 'bg-purple-950/30 border-purple-900/60'}`}
          >
            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Component from Prompt</span>
            </h3>
            <p className={`text-[10px] mb-3 ${muted}`}>
              Describe any component in plain language and it will be added straight to your component list.
            </p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={2}
              spellCheck={false}
              placeholder='e.g. "a pricing card with a gradient border showing a monthly plan"'
              className={`${inputBase(isLight)} resize-y`}
            />
            <button
              onClick={handleGenerateFromPrompt}
              disabled={isGenerating}
              className="mt-3 w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-sky-500 hover:shadow-md hover:shadow-purple-600/30 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating…' : 'Generate & Add to List'}</span>
            </button>
          </section>

          {/* Add form */}
          <section>
            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center space-x-1.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Component</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Component Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. MyCard"
                  className={inputBase(isLight)}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>JSX Code</label>
                <textarea
                  value={jsxCode}
                  onChange={e => setJsxCode(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  placeholder={`function MyCard({ title }) {\n  return (\n    <div className="my-card">\n      <h1>{title}</h1>\n    </div>\n  );\n}`}
                  className={`${inputBase(isLight)} resize-y`}
                />
                <p className={`text-[10px] mt-1 ${muted}`}>Must define <code className="font-mono font-bold">function {name || 'ComponentName'}(...)</code> and use the component name exactly.</p>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>CSS Code</label>
                <textarea
                  value={cssCode}
                  onChange={e => setCssCode(e.target.value)}
                  rows={5}
                  spellCheck={false}
                  placeholder={`.my-card {\n  padding: 24px;\n  background: #f8fafc;\n  border-radius: 12px;\n}`}
                  className={`${inputBase(isLight)} resize-y`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Props JSON (optional)</label>
                <textarea
                  value={propsJson}
                  onChange={e => setPropsJson(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  placeholder={`{ "title": "Hello World" }`}
                  className={`${inputBase(isLight)} resize-y`}
                />
              </div>

              {error && (
                <div className={`flex items-start space-x-2 text-[11px] p-2.5 rounded-lg border ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-md hover:shadow-purple-600/30 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Add & Select Component</span>
              </button>
            </div>
          </section>

          {/* Custom components list */}
          <section>
            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              Your Custom Components ({customComponents.length})
            </h3>

            {customComponents.length === 0 ? (
              <div className={`text-center py-6 rounded-xl border border-dashed text-xs ${muted} ${border}`}>
                No custom components yet. Add one above — it will persist across page reloads.
              </div>
            ) : (
              <div className="space-y-1.5">
                {customComponents.map(comp => (
                  <div key={comp.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>&lt;{comp.name} /&gt;</span>
                      <span className={`text-[10px] ml-2 ${muted}`}>{comp.code.length} chars</span>
                    </div>
                    <button
                      onClick={() => onRemove(comp.id)}
                      className={`p-1.5 rounded-md border transition-colors ${isLight ? 'bg-white hover:bg-rose-50 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200' : 'bg-slate-900 hover:bg-rose-950/40 border-slate-700 text-slate-500 hover:text-rose-400'}`}
                      title={`Remove ${comp.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
