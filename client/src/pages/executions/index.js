import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Activity,
  ArrowRight,
  Filter,
  Layers,
  PauseCircle
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/executions', {
        params: { status: statusFilter },
      });
      setExecutions(res.data.executions || []);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();

    const socket = getSocket();
    if (socket) {
      const handleFeed = (event) => {
        fetchExecutions();
      };
      socket.on('dashboard:feed', handleFeed);
      return () => socket.off('dashboard:feed', handleFeed);
    }
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            RUNNING
          </span>
        );
      case 'RETRYING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            RETRYING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            <PauseCircle className="w-3.5 h-3.5" />
            PAUSED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
            <AlertOctagon className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Execution History">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Execution Audit Log</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live multi-agent execution telemetry and step audit trails
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="RUNNING">Running</option>
              <option value="RETRYING">Retrying</option>
              <option value="PAUSED">Paused</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Executions Table */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Loading execution runs...</div>
          ) : executions.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm space-y-2">
              <PlayCircle className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-semibold text-white">No execution runs recorded</p>
              <p className="text-xs text-slate-400">Trigger a workflow run to view timeline telemetry here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3.5 px-6">Workflow Run</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Current Step / Error</th>
                    <th className="py-3.5 px-6">Duration</th>
                    <th className="py-3.5 px-6">Started At</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {executions.map((exec) => (
                    <tr key={exec._id} className="hover:bg-dark-850/50 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/executions/${exec._id}`}
                          className="font-semibold text-white hover:text-brand-300 flex items-center gap-2"
                        >
                          <Layers className="w-4 h-4 text-brand-400" />
                          <span>{exec.snapshot?.name || 'Automation Run'}</span>
                        </Link>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                          ID: {exec._id}
                        </span>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(exec.status)}</td>
                      <td className="py-4 px-6">
                        {exec.error ? (
                          <span className="text-rose-400 font-mono text-[11px] truncate block max-w-xs">
                            {typeof exec.error === 'object' ? exec.error.message : String(exec.error)}
                          </span>
                        ) : exec.currentNode ? (
                          <span className="text-slate-300 font-mono text-[11px]">
                            Node: {exec.currentNode}
                          </span>
                        ) : (
                          <span className="text-slate-500">All nodes processed</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'active...'}
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-mono">
                        {new Date(exec.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/executions/${exec._id}`}
                          className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          Timeline
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
