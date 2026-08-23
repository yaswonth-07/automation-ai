import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  GitFork,
  PlayCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Plus
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();
    if (socket) {
      const handleFeed = (event) => {
        setLiveFeed((prev) => [event, ...prev.slice(0, 15)]);
      };
      socket.on('dashboard:feed', handleFeed);
      return () => socket.off('dashboard:feed', handleFeed);
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'RUNNING':
      case 'RETRYING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono animate-pulse">
            <Activity className="w-3 h-3" />
            {status}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
            <AlertOctagon className="w-3 h-3" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Dashboard">
        {/* Welcome Banner / Prompt Quick Access */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-dark-900 to-purple-950/30 border border-brand-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-mono font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Multi-Agent Engine
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Operations Automation Console
            </h1>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Design complex visual graph automations or generate them from natural language prompts.
              Executed with 5 cooperating agents, live timeline streaming, and real-time retries.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/workflows/builder"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              AI Prompt Builder
            </Link>
            <Link
              href="/workflows"
              className="px-4 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <MetricGrid stats={stats} />

        {/* 2-Column: Recent Executions & Live AI Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Executions (2 Cols) */}
          <div className="lg:col-span-2 bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Recent Executions</h2>
                <p className="text-xs text-slate-400">Audit trail of recent orchestration runs</p>
              </div>
              <Link
                href="/executions"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading runs...</div>
            ) : !stats?.recentExecutions?.length ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                <PlayCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No executions recorded yet.</p>
                <p className="text-xs text-slate-600 mt-1">
                  Create and execute a workflow to see its timeline here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {stats.recentExecutions.map((exec) => (
                  <div
                    key={exec._id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-dark-850/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/executions/${exec._id}`}
                        className="text-sm font-semibold text-white hover:text-brand-300 truncate block"
                      >
                        {exec.snapshot?.name || 'Unnamed Workflow Run'}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'running...'}
                        </span>
                        <span>•</span>
                        <span>{new Date(exec.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(exec.status)}
                      <Link
                        href={`/executions/${exec._id}`}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Multi-Agent Activity Stream (1 Col) */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h2 className="text-base font-bold text-white tracking-wide">Live Agent Stream</h2>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Socket.IO Live
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
              {liveFeed.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-xs">
                  <Activity className="w-6 h-6 mx-auto mb-2 opacity-30 text-brand-400" />
                  Waiting for agent orchestration events...
                </div>
              ) : (
                liveFeed.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-dark-850 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-brand-400 font-bold uppercase">{event.agent}</span>
                      <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200 line-clamp-2">{event.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
