import React from 'react';
import {
  Compass,
  Play,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Clock,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

const AGENT_CONFIGS = {
  planner: {
    name: 'Planner Agent',
    icon: Compass,
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
  },
  execution: {
    name: 'Execution Agent',
    icon: Play,
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  validation: {
    name: 'Validation Agent',
    icon: ShieldCheck,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  recovery: {
    name: 'Recovery Agent',
    icon: RotateCcw,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  monitoring: {
    name: 'Monitoring Agent',
    icon: Activity,
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    dot: 'bg-pink-400',
  },
  orchestrator: {
    name: 'Orchestrator Substrate',
    icon: Layers,
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400',
  },
};

export default function Timeline({ events = [], isLive = false }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>No execution events recorded yet.</p>
        <p className="text-xs text-slate-600 mt-1">Live timeline events will stream here when execution starts.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {events.map((event, idx) => {
        const agentKey = event.agent?.toLowerCase() || 'orchestrator';
        const config = AGENT_CONFIGS[agentKey] || AGENT_CONFIGS.orchestrator;
        const Icon = config.icon;

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-dark-950 ${config.dot} shadow-sm group-hover:scale-125 transition-transform`}
            />

            {/* Event Card */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                event.level === 'error'
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : event.level === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : `${config.bg} ${config.border}`
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${config.text} bg-dark-950/60 border border-slate-800`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.name}
                  </span>
                  {event.nodeId && (
                    <span className="text-[10px] font-mono text-slate-400 bg-dark-850 px-1.5 py-0.5 rounded border border-slate-800">
                      Node: {event.nodeId}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {event.createdAt ? new Date(event.createdAt).toLocaleTimeString() : 'Just now'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans">{event.message}</p>

              {/* Metadata Details (if present) */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-dark-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-32">
                  <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
