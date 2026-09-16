import {
  Cpu, ExternalLink, LibraryBig, PanelsTopLeft
} from 'lucide-react';
import type { PlaygroundComponent } from './playgroundTypes';

interface PlaygroundHeaderProps {
  selectedComp: PlaygroundComponent;
  components: PlaygroundComponent[];
  onSelectComponent: (comp: PlaygroundComponent) => void;
  theme: 'light' | 'dark';
  onOpenWorkspace: () => void;
  onOpenLibrary: () => void;
  onOpenWorkspaces: () => void;
}

export function PlaygroundHeader({
  selectedComp, components, onSelectComponent,
  theme, onOpenWorkspace, onOpenLibrary, onOpenWorkspaces
}: PlaygroundHeaderProps) {
  const isLight = theme === 'light';
  const panelBg = isLight ? 'bg-slate-50' : 'bg-slate-900';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`flex flex-col border-b ${border} ${panelBg} select-none text-xs`}>
      {/* Row 1: brand + component select + workspace button */}
      <div className="h-18 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2 min-w-0">
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
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xs shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-lg text-purple-700 dark:text-purple-300">AI Powered React Component Playground</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className={`font-semibold ${muted}`}>Select Component:</span>
          <select
            value={selectedComp.id}
            onChange={e => {
              const found = components.find(c => c.id === e.target.value);
              if (found) onSelectComponent(found);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold border focus:outline-none cursor-pointer ${isLight ? 'bg-white text-slate-800 border-slate-200 shadow-xs' : 'bg-slate-950 text-slate-200 border-slate-800'}`}
          >
            {components.map(c => (
              <option key={c.id} value={c.id}>
                {c.isCustom ? '★ ' : ''}&lt;{c.name} /&gt;
              </option>
            ))}
          </select>

          <button
            onClick={onOpenLibrary}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold border transition-all ${
              isLight
                ? 'bg-white text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-50 shadow-xs'
                : 'bg-slate-950 text-fuchsia-300 border-fuchsia-900 hover:bg-fuchsia-950/40'
            }`}
            title="Add or remove custom components in the library"
          >
            <LibraryBig className="w-3.5 h-3.5" />
            <span>Component Library</span>
          </button>

          <button
            onClick={onOpenWorkspace}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-md hover:shadow-purple-600/30 hover:scale-[1.03] active:scale-95"
            title="Open the Playground Workspace page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Playground Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
