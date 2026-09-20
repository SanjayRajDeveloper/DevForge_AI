import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  MonitorPlay,
  PanelsTopLeft,
  ArrowRight,
  Webhook,
  type LucideIcon
} from 'lucide-react';

export type HomeAction = 'home' | 'ide' | 'playground' | 'playground-workspace' | 'output-workspace' | 'workspaces' | 'api-tester';

export interface WorkspaceAction {
  id: Exclude<HomeAction, 'workspaces'>;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBox: string;
  hoverRing: string;
}

export function getWorkspaceActions(isLight: boolean): WorkspaceAction[] {
  return [
    {
      id: 'ide',
      title: 'HTML/CSS IDE',
      description: 'Edit code with live AI layout diagnostics, inline warnings and one-click quick fixes.',
      icon: LayoutDashboard,
      iconBox: isLight
        ? 'bg-blue-600 text-white shadow-blue-600/30'
        : 'bg-indigo-600 text-white shadow-indigo-600/30',
      hoverRing: 'group-hover:ring-blue-600/30'
    },
    {
      id: 'playground',
      title: 'Component Playground',
      description: 'Isolate and stress-test React components against layout failures before rendering.',
      icon: FlaskConical,
      iconBox: isLight
        ? 'bg-purple-600 text-white shadow-purple-600/30'
        : 'bg-purple-700 text-white shadow-purple-700/30',
      hoverRing: 'group-hover:ring-purple-600/30'
    },
    {
      id: 'playground-workspace',
      title: 'Playground Workspace',
      description: 'View the live React component output full screen, with breakpoint and custom width controls.',
      icon: PanelsTopLeft,
      iconBox: isLight
        ? 'bg-fuchsia-600 text-white shadow-fuchsia-600/30'
        : 'bg-fuchsia-700 text-white shadow-fuchsia-700/30',
      hoverRing: 'group-hover:ring-fuchsia-600/30'
    },
    {
      id: 'output-workspace',
      title: 'AI Output Workspace',
      description: 'Compare original output against the AI-fixed layout across every breakpoint.',
      icon: MonitorPlay,
      iconBox: isLight
        ? 'bg-teal-600 text-white shadow-teal-600/30'
        : 'bg-teal-700 text-white shadow-teal-700/30',
      hoverRing: 'group-hover:ring-teal-600/30'
    },
    {
      id: 'api-tester',
      title: 'API Endpoint Tester',
      description: 'Paste a GitHub repo link to surface its API endpoints and test them like Postman.',
      icon: Webhook,
      iconBox: isLight
        ? 'bg-sky-600 text-white shadow-sky-600/30'
        : 'bg-sky-700 text-white shadow-sky-700/30',
      hoverRing: 'group-hover:ring-sky-600/30'
    }
  ];
}

export const WorkspaceCard: React.FC<{
  action: WorkspaceAction;
  isLight: boolean;
  onNavigate: (mode: HomeAction) => void;
  index: number;
}> = ({ action, isLight, onNavigate, index }) => {
  const Icon = action.icon;
  const col = index % 4;
  const glow = isLight ? 'rgba(139, 92, 246, 0.5)' : 'rgba(167, 139, 250, 0.45)';
  const edge = isLight ? 'rgba(129, 140, 248, 0.45)' : 'rgba(129, 140, 248, 0.35)';
  const spotBg =
    col === 0
      ? `linear-gradient(90deg, ${glow}, ${edge} 55%, transparent 85%)`
      : col === 3
      ? `linear-gradient(270deg, ${glow}, ${edge} 55%, transparent 85%)`
      : `linear-gradient(180deg, ${glow}, ${edge} 45%, transparent 80%), linear-gradient(0deg, ${glow}, ${edge} 45%, transparent 80%)`;
  const cardBase =
    'group relative rounded-2xl p-6 pt-16 min-h-[17.25rem] border spot-glow-hover pressable spot-card sheen cursor-pointer transition-all duration-500 backdrop-blur-md ' +
    'hover:-translate-y-2 hover:scale-[1.02] ' +
    (isLight
      ? 'bg-white/20 border-slate-200/60 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-400/20 hover:bg-white/30'
      : 'bg-slate-900/15 border-slate-800 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-600/25 hover:bg-slate-900/35');

  return (
    <button
      onClick={() => onNavigate(action.id)}
      className={`${cardBase} animate-fade-in-up`}
      style={{ animationDelay: `${120 + index * 110}ms`, '--spot-bg': spotBg } as React.CSSProperties}
    >
      <div
        className={`absolute left-3 top-3 w-12 h-12 rounded-xl flex items-center justify-center shadow-md ring-4 ring-transparent transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 group-hover:shadow-xl ${action.iconBox} ${action.hoverRing}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="mt-4 font-bold text-base flex items-center justify-between">
        {action.title}
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-400 group-hover:translate-x-1" />
      </h4>
      <p className={`mt-1.5 text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
        {action.description}
      </p>
    </button>
  );
};