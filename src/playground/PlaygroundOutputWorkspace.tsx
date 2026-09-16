import { useState } from 'react';
import { ArrowLeft, Smartphone, Tablet, Laptop, Monitor, PanelsTopLeft } from 'lucide-react';
import { DEVICE_SIZES, type PlaygroundComponent } from './playgroundTypes';
import { ComponentFrame } from './ComponentFrame';

const ICON_MAP: Record<string, typeof Smartphone> = {
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  monitor: Monitor,
};

interface PlaygroundOutputWorkspaceProps {
  theme: 'light' | 'dark';
  jsxCode: string;
  cssCode: string;
  propsJson: string;
  selectedComp: PlaygroundComponent;
  components: PlaygroundComponent[];
  onSelectComponent: (comp: PlaygroundComponent) => void;
  isDarkModePreview: boolean;
  isRTLPreview: boolean;
  onClose: () => void;
  onOpenWorkspaces: () => void;
}

export function PlaygroundOutputWorkspace({
  theme, jsxCode, cssCode, propsJson, selectedComp, components, onSelectComponent,
  isDarkModePreview, isRTLPreview, onClose, onOpenWorkspaces
}: PlaygroundOutputWorkspaceProps) {
  const isLight = theme === 'light';
  const [deviceWidth, setDeviceWidth] = useState(1024);

  const bg = isLight ? 'bg-slate-50' : 'bg-slate-950';
  const panelBg = isLight ? 'bg-white' : 'bg-slate-900';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  const frameProps = {
    jsxCode,
    cssCode,
    propsJson,
    componentName: selectedComp.name,
    isLight,
    isDarkModePreview,
    isRTLPreview,
  };

  return (
    <div className={`h-full flex flex-col font-sans overflow-hidden transition-colors ${bg} ${text}`}>
      <header className={`h-22 px-5 flex items-center justify-between border-b shrink-0 ${panelBg} ${border}`}>
        <div className="flex items-center space-x-3">
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
          <button
            onClick={onClose}
            className={`p-2.5 rounded-lg border flex items-center justify-center transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title="Return to Component Playground Editor"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-semibold">Back to Playground</span>
          </button>
          <div>
            <h1 className={`font-extrabold text-xl tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {selectedComp.name} Output
            </h1>
            <p className={`text-xs font-semibold ${mutedText}`}>Rendered component output</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`text-xs font-semibold ${mutedText}`}>Select Component:</span>
          <select
            value={selectedComp.id}
            onChange={e => {
              const found = components.find(c => c.id === e.target.value);
              if (found) onSelectComponent(found);
            }}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold border focus:outline-none cursor-pointer transition-colors ${
              isLight
                ? 'bg-white text-slate-800 border-slate-200 shadow-xs hover:border-slate-300'
                : 'bg-slate-950 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
          >
            {components.map(c => (
              <option key={c.id} value={c.id}>
                {c.isCustom ? '★ ' : ''}&lt;{c.name} /&gt;
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Breakpoint bar */}
      <div className={`h-12 flex items-center justify-between px-4 border-b shrink-0 ${panelBg} ${border}`}>
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 ml-1">
            {DEVICE_SIZES.map(d => {
              const Icon = ICON_MAP[d.icon] || Smartphone;
              const isActive = deviceWidth === d.width;
              return (
                <button
                  key={d.id}
                  onClick={() => setDeviceWidth(isActive ? 0 : d.width)}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : `${panelBg} ${mutedText} ${isLight ? 'hover:bg-slate-100 border border-slate-200' : 'hover:bg-slate-800 border border-slate-800'}`
                  }`}
                  title={`${d.label} (${d.width}px)`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{d.width}px</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-semibold ${mutedText}`}>Custom Width:</span>
            <input
              type="range"
              min={300}
              max={1600}
              value={deviceWidth}
              onChange={e => setDeviceWidth(Number(e.target.value))}
              className="w-32 accent-purple-600 cursor-pointer"
              title="Drag to set a custom viewport width"
            />
            <span className={`font-mono font-bold text-[10px] w-10 text-right ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
              {deviceWidth}px
            </span>
          </div>
          {deviceWidth > 0 && (
            <div className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              Viewport: {deviceWidth}px
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto flex flex-col items-center justify-start relative">
          <div className="flex-1 w-full max-w-6xl flex items-center justify-center">
            <div
              className={`rounded-2xl border-4 shadow-2xl overflow-hidden relative ${
                isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'
              }`}
              style={{
                width: deviceWidth > 0 ? `${deviceWidth}px` : '100%',
                height: 'calc(100vh - 280px)',
                minHeight: '480px',
                maxWidth: '100%',
              }}
            >
              <ComponentFrame {...frameProps} width={0} />
              <div
                className="absolute top-0 left-0 rounded-br-xl px-2.5 py-1 text-white text-[10px] font-bold shadow-md flex items-center gap-1.5"
                style={{ backgroundColor: '#a855f7' }}
              >
                {selectedComp.name} · {deviceWidth > 0 ? `${deviceWidth}px` : 'Auto'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
