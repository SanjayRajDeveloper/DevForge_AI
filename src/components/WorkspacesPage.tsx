import React from 'react';
import { Home } from 'lucide-react';
import { getWorkspaceActions, WorkspaceCard, type HomeAction } from './workspaceActions';
import { CardCarousel } from './CardCarousel';

const BirdsBackground = React.lazy(() =>
  import('./BirdsBackground').then(m => ({ default: m.BirdsBackground }))
);

interface WorkspacesPageProps {
  theme: 'light' | 'dark';
  onNavigate: (mode: HomeAction) => void;
}

export const WorkspacesPage: React.FC<WorkspacesPageProps> = ({
  theme,
  onNavigate
}) => {
  const isLight = theme === 'light';
  const actions = getWorkspaceActions(isLight);

  return (
    <main
      className={`relative flex-1 overflow-y-auto select-none transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'}`}
      style={{ background: 'linear-gradient(180deg, #070d28 0%, #0b1536 45%, #050b24 100%)' }}
    >
      {/* Bird flock background */}
      <React.Suspense
        fallback={<div className="absolute inset-0 w-full h-full bg-[#0b1536]" />}
      >
        <BirdsBackground className="absolute inset-0 w-full h-full" />
      </React.Suspense>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.35)_82%,rgba(2,6,23,0.8)_100%)] pointer-events-none" />

      <div className="relative p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-full">
        <button
          onClick={() => onNavigate('home')}
          className={`absolute bottom-5 left-5 z-10 inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-500 backdrop-blur-md cursor-pointer hover:-translate-y-1 hover:scale-[1.03] ${
            isLight
              ? 'bg-white/20 border-slate-200/60 text-slate-100 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-400/20 hover:bg-white/30'
              : 'bg-slate-900/15 border-slate-800 text-slate-100 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-600/25 hover:bg-slate-900/35'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-6xl pb-16">
          <CardCarousel fadeColor="#0b1536" dark>
            {actions.map((action, i) => (
              <WorkspaceCard
                key={action.id}
                action={action}
                isLight={isLight}
                onNavigate={onNavigate}
                index={i}
              />
            ))}
          </CardCarousel>
        </div>
      </div>
    </main>
  );
};