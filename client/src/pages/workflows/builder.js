import { useState } from 'react';
import { useRouter } from 'next/router';
import { Sparkles, Save, ArrowLeft, Play, Layers } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import PromptInputPanel from '../../components/PromptInputPanel/PromptInputPanel';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { nodes, edges, createWorkflow, isLoading } = useWorkflowStore();
  const [workflowMeta, setWorkflowMeta] = useState({
    name: 'AI Generated Automation',
    description: 'Graph generated from prompt',
  });

  const handleGenerated = (generated) => {
    setWorkflowMeta({
      name: generated.name || 'AI Generated Automation',
      description: generated.description || 'Compiled automation graph',
      tags: generated.tags || ['ai-generated'],
      triggerConfig: generated.triggerConfig,
    });
  };

  const handleSaveAndOpen = async () => {
    if (!nodes.length) {
      alert('Please generate a workflow graph first.');
      return;
    }

    try {
      const created = await createWorkflow({
        name: workflowMeta.name,
        description: workflowMeta.description,
        tags: workflowMeta.tags || ['ai-generated'],
        triggerConfig: workflowMeta.triggerConfig || { type: 'manual' },
        nodes,
        edges,
      });
      router.push(`/workflows/${created._id}`);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="AI Workflow Builder">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/workflows')}
              className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                Natural Language AI Workflow Builder
              </h1>
              <p className="text-xs text-slate-400">
                Compile plain English instructions into visual execution graphs
              </p>
            </div>
          </div>

          {nodes.length > 0 && (
            <button
              onClick={handleSaveAndOpen}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save to Workspace & Open Canvas
            </button>
          )}
        </div>

        {/* AI Input Panel */}
        <PromptInputPanel onGenerated={handleGenerated} />

        {/* Live Canvas Preview Panel */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Graph Preview ({nodes.length} Nodes)
              </h3>
            </div>
            {nodes.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Workflow: {workflowMeta.name}
              </span>
            )}
          </div>

          <div className="h-[480px] w-full rounded-xl overflow-hidden border border-slate-800/80">
            <WorkflowCanvas readOnly={false} />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
