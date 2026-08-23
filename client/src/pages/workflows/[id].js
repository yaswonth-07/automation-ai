import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Save,
  Play,
  Check,
  Loader2,
  GitFork,
  Activity
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    activeWorkflow,
    loadWorkflow,
    saveActiveWorkflow,
    isDirty,
    isLoading,
  } = useWorkflowStore();

  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow]);

  useEffect(() => {
    if (activeWorkflow) {
      setTitle(activeWorkflow.name);
      setDesc(activeWorkflow.description || '');
    }
  }, [activeWorkflow]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveActiveWorkflow();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    setExecuting(true);
    try {
      if (isDirty) {
        await saveActiveWorkflow();
      }
      const res = await api.post(`/workflows/${id}/execute`, {});
      router.push(`/executions/${res.data.data._id}`);
    } catch (err) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen w-screen bg-dark-950 flex flex-col overflow-hidden text-slate-100">
        {/* Editor Top Bar */}
        <header className="h-16 bg-dark-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/workflows')}
              className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-brand-500 focus:outline-none px-1 py-0.5"
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                v{activeWorkflow?.version || 1}
              </span>
              {isDirty && (
                <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                  • Unsaved Changes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Graph
            </button>
            <button
              onClick={handleRun}
              disabled={executing}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {executing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Initiating Run...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Execute Agent Chain
                </>
              )}
            </button>
          </div>
        </header>

        {/* 3-Column Layout: Left Palette | Center Canvas | Right Config */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Node Palette */}
          <NodePalette />

          {/* Center React Flow Canvas */}
          <div className="flex-1 h-full relative p-4 bg-dark-950">
            <WorkflowCanvas readOnly={false} />
          </div>

          {/* Right Node Config Inspector */}
          <NodeConfigPanel />
        </div>
      </div>
    </ProtectedRoute>
  );
}
