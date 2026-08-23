import React from 'react';
import { Trash2, X, Sliders, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, deleteNode, setSelectedNode } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <div className="w-72 bg-dark-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-500 shrink-0">
        <Sliders className="w-8 h-8 mb-3 opacity-30 text-slate-400" />
        <p className="text-xs font-semibold text-slate-400">No Node Selected</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Click any node on the canvas to configure its parameters and bindings.
        </p>
      </div>
    );
  }

  const { id, data = {} } = selectedNode;
  const params = data.params || {};

  const handleLabelChange = (e) => {
    updateNodeData(id, { label: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    updateNodeData(id, { description: e.target.value });
  };

  const handleParamChange = (key, value) => {
    updateNodeData(id, {
      params: {
        ...params,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 bg-dark-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Node Inspector</h3>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Body */}
      <div className="p-4 space-y-4 flex-1">
        {/* Node ID & Provider Badge */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>ID: {id}</span>
          <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase">
            {data.provider || 'system'}
          </span>
        </div>

        {/* Node Label */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Node Name</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={handleLabelChange}
            className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Description</label>
          <textarea
            rows={2}
            value={data.description || ''}
            onChange={handleDescriptionChange}
            className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Dynamic Parameter Fields */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Step Parameters
          </span>

          {/* AI Node Instruction */}
          {data.category === 'ai' && (
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">AI Prompt / Instruction</label>
              <textarea
                rows={4}
                value={params.instruction || ''}
                onChange={(e) => handleParamChange('instruction', e.target.value)}
                className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none font-mono"
                placeholder="e.g. Extract invoice amount, due date, and vendor name..."
              />
            </div>
          )}

          {/* Gmail Parameters */}
          {data.provider === 'gmail' && data.action === 'send_email' && (
            <>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Recipient (To)</label>
                <input
                  type="text"
                  value={params.to || ''}
                  onChange={(e) => handleParamChange('to', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  placeholder="operator@company.com"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Subject</label>
                <input
                  type="text"
                  value={params.subject || ''}
                  onChange={(e) => handleParamChange('subject', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Email Body</label>
                <textarea
                  rows={3}
                  value={params.body || ''}
                  onChange={(e) => handleParamChange('body', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none font-mono"
                />
              </div>
            </>
          )}

          {/* Slack Parameters */}
          {data.provider === 'slack' && (
            <>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Channel</label>
                <input
                  type="text"
                  value={params.channel || ''}
                  onChange={(e) => handleParamChange('channel', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  placeholder="#devops-alerts"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Message Text</label>
                <textarea
                  rows={3}
                  value={params.text || ''}
                  onChange={(e) => handleParamChange('text', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Discord Parameters */}
          {data.provider === 'discord' && (
            <>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Channel ID / Name</label>
                <input
                  type="text"
                  value={params.channelId || ''}
                  onChange={(e) => handleParamChange('channelId', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={params.content || ''}
                  onChange={(e) => handleParamChange('content', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Google Sheets Parameters */}
          {data.provider === 'google-sheets' && (
            <>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Spreadsheet ID</label>
                <input
                  type="text"
                  value={params.spreadsheetId || ''}
                  onChange={(e) => handleParamChange('spreadsheetId', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Sheet Range</label>
                <input
                  type="text"
                  value={params.range || ''}
                  onChange={(e) => handleParamChange('range', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </>
          )}

          {/* Logic / Condition Parameters */}
          {data.category === 'logic' && (
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Evaluation Expression</label>
              <input
                type="text"
                value={params.condition || ''}
                onChange={(e) => handleParamChange('condition', e.target.value)}
                className="w-full px-3 py-2 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                placeholder="output.confidence > 0.85"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer / Delete */}
      <div className="p-4 border-t border-slate-800 bg-dark-850">
        <button
          onClick={() => deleteNode(id)}
          className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
