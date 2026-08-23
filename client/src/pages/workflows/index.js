import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  GitFork,
  Plus,
  Search,
  Play,
  Copy,
  Trash2,
  Edit,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows', {
        params: { search, status: statusFilter },
      });
      setWorkflows(res.data.workflows || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Automation Workflow',
        description: 'Visual graph automation created by operator',
        nodes: [
          {
            id: 'node-1',
            type: 'triggerNode',
            position: { x: 250, y: 100 },
            data: { label: 'Manual Trigger', category: 'trigger', provider: 'system', action: 'manual_trigger' },
          },
        ],
        edges: [],
      });
      router.push(`/workflows/${res.data.data._id}`);
    } catch (err) {
      alert(`Error creating workflow: ${err.message}`);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleExecute = async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/execute`, {});
      router.push(`/executions/${res.data.data._id}`);
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Workflows">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Automation Workflows</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage and execute your visual automation graphs</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/workflows/builder"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              AI Prompt Builder
            </Link>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-400" />
              Manual Canvas
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-dark-900 border border-slate-800 p-4 rounded-2xl">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows by title or description..."
              className="w-full pl-10 pr-4 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4">
            <GitFork className="w-12 h-12 mx-auto text-slate-600" />
            <div>
              <h3 className="text-base font-bold text-white">No workflows found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Generate an automation workflow from natural language or build one manually on the canvas.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflows.map((wf) => (
              <div
                key={wf._id}
                className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      v{wf.version} • {wf.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(wf._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(wf._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-dark-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/workflows/${wf._id}`} className="block">
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                      {wf.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {wf.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {wf.nodes?.length || 0} nodes
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(wf.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <Link
                    href={`/workflows/${wf._id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Open Canvas
                  </Link>
                  <button
                    onClick={() => handleExecute(wf._id)}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
