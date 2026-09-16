import { useState, useEffect, useMemo } from 'react';
import { PlaygroundHeader } from './PlaygroundHeader';
import { PlaygroundEditor } from './PlaygroundEditor';
import { PlaygroundOutputWorkspace } from './PlaygroundOutputWorkspace';
import { PlaygroundComponentLibrary } from './PlaygroundComponentLibrary';
import {
  PLAYGROUND_SAMPLE_COMPONENTS, PLAYGROUND_SAMPLE_PROPS,
  type PlaygroundComponent
} from './playgroundTypes';

const CUSTOM_COMPONENTS_KEY = 'smartlayout_custom_components';

function loadCustomComponents(): PlaygroundComponent[] {
  try {
    const raw = localStorage.getItem(CUSTOM_COMPONENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(c => c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.code === 'string' && typeof c.css === 'string');
  } catch {
    return [];
  }
}

interface PlaygroundProps {
  theme: 'light' | 'dark';
  view: 'editor' | 'workspace';
  onViewChange: (view: 'editor' | 'workspace') => void;
  onOpenWorkspaces: () => void;
}

export function Playground({ theme, view, onViewChange, onOpenWorkspaces }: PlaygroundProps) {
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white' : 'bg-slate-950';
  const text = isLight ? 'text-slate-900' : 'text-slate-100';

  // Core component state
  const [selectedComp, setSelectedComp] = useState<PlaygroundComponent>(PLAYGROUND_SAMPLE_COMPONENTS[0]);
  const [jsxCode, setJsxCode] = useState(PLAYGROUND_SAMPLE_COMPONENTS[0].code);
  const [cssCode, setCssCode] = useState(PLAYGROUND_SAMPLE_COMPONENTS[0].css);
  const [editorTab, setEditorTab] = useState<'jsx' | 'css'>('jsx');
  const [propsJson, setPropsJson] = useState(
    JSON.stringify(PLAYGROUND_SAMPLE_PROPS[PLAYGROUND_SAMPLE_COMPONENTS[0].id] || {}, null, 2)
  );

  // Custom component library (persisted in localStorage)
  const [customComponents, setCustomComponents] = useState<PlaygroundComponent[]>(loadCustomComponents);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(CUSTOM_COMPONENTS_KEY, JSON.stringify(customComponents)); } catch { /* ignore */ }
  }, [customComponents]);

  const allComponents = useMemo(
    () => [...PLAYGROUND_SAMPLE_COMPONENTS, ...customComponents],
    [customComponents]
  );

  // Viewport & mode state (fixed preview toggles; toggling UI removed with diagnostics panel)
  const isDarkModePreview = false;
  const isRTLPreview = false;

  // Component Selection
  const handleSelectComponent = (comp: PlaygroundComponent) => {
    setSelectedComp(comp);
    setJsxCode(comp.code);
    setCssCode(comp.css);
    setPropsJson(comp.propsJson ?? JSON.stringify(PLAYGROUND_SAMPLE_PROPS[comp.id] || {}, null, 2));
  };

  // Custom component library handlers
  const handleAddCustomComponent = (comp: PlaygroundComponent) => {
    setCustomComponents(prev => [...prev, comp]);
    handleSelectComponent(comp);
  };

  const handleRemoveCustomComponent = (id: string) => {
    const next = customComponents.filter(c => c.id !== id);
    setCustomComponents(next);
    if (selectedComp.id === id) {
      const fallback = next.length > 0 ? next[0] : PLAYGROUND_SAMPLE_COMPONENTS[0];
      handleSelectComponent(fallback);
    }
  };

  // AI Report Export
  return (
    <div className={`h-full flex flex-col ${bg} ${text} overflow-hidden font-sans`}>

      {view === 'workspace' ? (
        <PlaygroundOutputWorkspace
          theme={theme}
          jsxCode={jsxCode}
          cssCode={cssCode}
          propsJson={propsJson}
          selectedComp={selectedComp}
          components={allComponents}
          onSelectComponent={handleSelectComponent}
          isDarkModePreview={isDarkModePreview}
          isRTLPreview={isRTLPreview}
          onClose={() => onViewChange('editor')}
          onOpenWorkspaces={onOpenWorkspaces}
        />
      ) : (
        <>
          <PlaygroundHeader
            selectedComp={selectedComp}
            components={allComponents}
            onSelectComponent={handleSelectComponent}
            theme={theme}
            onOpenWorkspace={() => onViewChange('workspace')}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            onOpenWorkspaces={onOpenWorkspaces}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <PlaygroundEditor
              jsxCode={jsxCode}
              cssCode={cssCode}
              editorTab={editorTab}
              onEditorTabChange={setEditorTab}
              onJsxChange={setJsxCode}
              onCssChange={setCssCode}
              selectedCompName={selectedComp.name}
              theme={theme}
            />
          </div>
        </>
      )}

      {/* Custom Component Library Modal */}
      <PlaygroundComponentLibrary
        theme={theme}
        customComponents={customComponents}
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAdd={handleAddCustomComponent}
        onRemove={handleRemoveCustomComponent}
      />
    </div>
  );
}
