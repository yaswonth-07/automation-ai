import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Zap,
  Mail,
  MessageSquare,
  Bot,
  GitBranch,
  Table,
  Cpu,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

const getProviderIcon = (provider, category) => {
  switch (provider) {
    case 'gmail':
      return <Mail className="w-4 h-4 text-rose-400" />;
    case 'slack':
      return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    case 'discord':
      return <Bot className="w-4 h-4 text-indigo-400" />;
    case 'google-sheets':
      return <Table className="w-4 h-4 text-emerald-500" />;
    case 'llm':
      return <Sparkles className="w-4 h-4 text-purple-400" />;
    default:
      if (category === 'trigger') return <Zap className="w-4 h-4 text-amber-400" />;
      if (category === 'logic') return <GitBranch className="w-4 h-4 text-cyan-400" />;
      return <Cpu className="w-4 h-4 text-slate-300" />;
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'trigger':
      return 'border-amber-500/50 bg-amber-950/20 shadow-amber-500/10';
    case 'ai':
      return 'border-purple-500/50 bg-purple-950/20 shadow-purple-500/10';
    case 'integration':
      return 'border-indigo-500/50 bg-indigo-950/20 shadow-indigo-500/10';
    case 'logic':
      return 'border-cyan-500/50 bg-cyan-950/20 shadow-cyan-500/10';
    default:
      return 'border-slate-700 bg-dark-900';
  }
};

export const TriggerNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 transition-all min-w-[220px] shadow-lg backdrop-blur-md ${getCategoryColor('trigger')} ${
        selected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-dark-950 scale-105' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded bg-amber-500/20 border border-amber-500/30">
          {getProviderIcon(data.provider, 'trigger')}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
          TRIGGER
        </span>
      </div>
      <div className="font-semibold text-sm text-white truncate">{data.label || 'Trigger Node'}</div>
      <div className="text-[11px] text-slate-400 truncate mt-0.5">{data.description || data.action || 'Initiates workflow'}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-amber-400 border-2 !border-dark-950" />
    </div>
  );
});

export const AINode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 transition-all min-w-[220px] shadow-lg backdrop-blur-md ${getCategoryColor('ai')} ${
        selected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-dark-950 scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-400 border-2 !border-dark-950" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded bg-purple-500/20 border border-purple-500/30">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
          AI AGENT
        </span>
      </div>
      <div className="font-semibold text-sm text-white truncate">{data.label || 'AI Analysis'}</div>
      <div className="text-[11px] text-slate-400 truncate mt-0.5">{data.description || 'Claude / Gemini reasoning'}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-400 border-2 !border-dark-950" />
    </div>
  );
});

export const IntegrationNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 transition-all min-w-[220px] shadow-lg backdrop-blur-md ${getCategoryColor('integration')} ${
        selected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-dark-950 scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-indigo-400 border-2 !border-dark-950" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded bg-indigo-500/20 border border-indigo-500/30">
          {getProviderIcon(data.provider, 'integration')}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
          {data.provider ? data.provider.toUpperCase() : 'INTEGRATION'}
        </span>
      </div>
      <div className="font-semibold text-sm text-white truncate">{data.label || 'Action Step'}</div>
      <div className="text-[11px] text-slate-400 truncate mt-0.5">{data.description || data.action}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-indigo-400 border-2 !border-dark-950" />
    </div>
  );
});

export const LogicNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 transition-all min-w-[220px] shadow-lg backdrop-blur-md ${getCategoryColor('logic')} ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-dark-950 scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-cyan-400 border-2 !border-dark-950" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded bg-cyan-500/20 border border-cyan-500/30">
          <GitBranch className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
          LOGIC GATE
        </span>
      </div>
      <div className="font-semibold text-sm text-white truncate">{data.label || 'Condition Check'}</div>
      <div className="text-[11px] text-slate-400 truncate mt-0.5">{data.params?.condition || 'Validate condition'}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-cyan-400 border-2 !border-dark-950" />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }) => {
  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 border-slate-700 bg-dark-900 transition-all min-w-[220px] shadow-lg backdrop-blur-md ${
        selected ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-dark-950 scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-brand-400 border-2 !border-dark-950" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1 rounded bg-brand-500/20 border border-brand-500/30">
          <Cpu className="w-4 h-4 text-brand-400" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
          ACTION
        </span>
      </div>
      <div className="font-semibold text-sm text-white truncate">{data.label || 'Custom Action'}</div>
      <div className="text-[11px] text-slate-400 truncate mt-0.5">{data.description || data.action || 'Custom execution'}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-brand-400 border-2 !border-dark-950" />
    </div>
  );
});
