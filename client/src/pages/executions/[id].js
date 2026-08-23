import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Clock,
  RotateCcw,
  Layers,
  Code
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import Timeline from '../../components/Timeline/Timeline';
import api from '../../services/api';
import { subscribeToExecution } from '../../services/socket';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'snapshot' | 'outputs'

  const fetchExecutionData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [execRes, timelineRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`),
      ]);
      setExecution(execRes.data.data);
      setTimelineLogs(timelineRes.data.data || []);
    } catch (err) {
      console.error('Failed to load execution data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutionData();

    if (!id) return;
    const unsubscribe = subscribeToExecution(id, (event) => {
      setTimelineLogs((prev) => [...prev, event]);
      // Update execution status if orchestrator completes or changes
      api.get(`/executions/${id}`).then((res) => setExecution(res.data.data)).catch(() => {});
    });

    return unsubscribe;
  }, [id]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/executions/${id}/pause`);
      setExecution(res.data.execution);
    } catch (err) {
      alert(`Pause failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/executions/${id}/resume`);
      setExecution(res.data.execution);
    } catch (err) {
      alert(`Resume failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this execution run?')) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/executions/${id}/cancel`);
      setExecution(res.data.execution);
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const isLive = execution?.status === 'RUNNING' || execution?.status === 'RETRYING';

  return (
    <ProtectedRoute>
      <AppShell title="Execution Telemetry">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/executions')}
              className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {execution?.snapshot?.name || 'Execution Run'}
                </h1>
                {isLive && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-mono animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    STREAMING LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Execution ID: {id}</p>
            </div>
          </div>

          {/* Execution Controls (Pause / Resume / Cancel) */}
          <div className="flex items-center gap-2">
            {execution?.status === 'RUNNING' && (
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause Run
              </button>
            )}

            {execution?.status === 'PAUSED' && (
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Resume Run
              </button>
            )}

            {['RUNNING', 'PENDING', 'PAUSED', 'RETRYING'].includes(execution?.status) && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Run
              </button>
            )}
          </div>
        </div>

        {/* Execution Summary KPI Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-dark-900 border border-slate-800 rounded-2xl shadow-lg">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Run Status</span>
            <div className="text-sm font-bold text-white mt-1 font-mono">{execution?.status || 'PENDING'}</div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Total Duration</span>
            <div className="text-sm font-bold text-white mt-1 font-mono">
              {execution?.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'active...'}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Recovery Retries</span>
            <div className="text-sm font-bold text-amber-400 mt-1 font-mono">
              {execution?.retryCount || 0}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Started At</span>
            <div className="text-xs font-semibold text-slate-300 mt-1 font-mono">
              {execution?.startTime ? new Date(execution.startTime).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Agent Timeline ({timelineLogs.length} Events)
          </button>
          <button
            onClick={() => setActiveTab('outputs')}
            className={`pb-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'outputs'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Step Outputs & Artifacts
          </button>
          <button
            onClick={() => setActiveTab('snapshot')}
            className={`pb-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'snapshot'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Immutable Graph Snapshot
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'timeline' && (
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <Timeline events={timelineLogs} isLive={isLive} />
          </div>
        )}

        {activeTab === 'outputs' && (
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Captured Outputs</h3>
            <pre className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(execution?.outputs || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'snapshot' && (
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Runtime Workflow Graph Snapshot
            </h3>
            <pre className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(execution?.snapshot || {}, null, 2)}
            </pre>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
