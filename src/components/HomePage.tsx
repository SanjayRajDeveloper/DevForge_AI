import React from 'react';
import { ArrowRight, Rocket } from 'lucide-react';
import { SpaceBackground } from './SpaceBackground';
import { SaturnPlanet } from './SaturnPlanet';
import type { HomeAction } from './workspaceActions';

interface HomePageProps {
  theme: 'light' | 'dark';
  onNavigate: (mode: HomeAction) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  theme,
  onNavigate
}) => {
  const isLight = theme === 'light';

  return (
    <main
      className={`flex-1 overflow-hidden select-none transition-colors ${
        isLight ? 'text-slate-900' : 'text-slate-100'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #070d28 0%, #0b1536 45%, #050b24 100%)',
      }}
    >
      {/* ── Outer padded container ── */}
      <div className="p-4 md:p-6 lg:p-8 h-full">
        <div
          className="rounded-3xl p-[3px] h-full conic-move"
          style={{
            boxShadow:
              '0 0 20px rgba(109, 40, 217, 0.38), 0 0 40px rgba(37, 99, 235, 0.24), 0 0 60px rgba(29, 78, 216, 0.15), 0 0 80px rgba(76, 29, 149, 0.09)',
          }}
        >
          <div
            className={`rounded-[21px] overflow-hidden h-full ${
              isLight ? 'bg-white' : 'bg-slate-900'
            }`}
          >
          {/* ── Hero / Console (full-page space view) ── */}
          <section className="relative shrink-0 h-full flex flex-col justify-center overflow-hidden">
            <SpaceBackground className="absolute inset-0 w-full h-full" />

            {/* deep space vignette for content readability */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.55)_78%,rgba(2,6,23,0.9)_100%)]" />

            {/* sci-fi header line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

            <div className="absolute left-4 md:left-14 bottom-24 w-3 h-3 rounded-full bg-slate-300/80 blur-[1px] animate-bob" style={{ animationDuration: '5s' }} />
            <div className="absolute left-12 md:left-32 bottom-14 w-2 h-2 rounded-full bg-amber-200/70 blur-[1px] animate-bob" style={{ animationDuration: '7s', animationDelay: '0.8s' }} />
            <div className="absolute left-24 md:left-52 bottom-36 w-4 h-4 rounded-full bg-slate-200/60 blur-[2px] animate-bob" style={{ animationDuration: '8.5s', animationDelay: '1.4s' }} />

            {/* Transparent Saturn — bottom-right accent */}
            <SaturnPlanet className="pointer-events-none absolute -bottom-16 right-[20px] h-[340px] w-[340px] opacity-35 md:-bottom-8 md:right-[20px] md:h-[420px] md:w-[420px]" />

            <div className="relative max-w-6xl mx-auto w-full px-6 md:px-10 pt-12 pb-72">
              <div className="animate-fade-in-up">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-100 to-indigo-300 animate-title-shimmer drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]" style={{ animationDuration: '2.5s' }}>
                  SmartLayout AI Console
                </h2>

                <button
                  onClick={() => onNavigate('workspaces')}
                  className="group/btn mt-8 inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600/80 to-sky-400/80 backdrop-blur-md hover:from-purple-500/90 hover:to-sky-300/90 shadow-lg shadow-purple-600/30 hover:shadow-[0_0_22px_rgba(147,51,234,0.45),0_0_45px_rgba(56,189,248,0.3)] hover:scale-105 active:scale-95 border border-purple-400/40 animate-btn-flow opacity-80 hover:opacity-100"
                >
                  <Rocket className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  <span>Explore Workspaces</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </section>
        </div>
        </div>
      </div>
    </main>
  );
};