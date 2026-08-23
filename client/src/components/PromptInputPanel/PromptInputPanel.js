import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Zap, Send, FileText, Bell } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const PROMPT_PRESETS = [
  {
    title: 'Invoice Processing & Approval',
    prompt: 'When an invoice email is received via Gmail, extract the invoice amount and vendor name with AI, check if confidence is above 0.85, log the row to Google Sheets, and post an alert to Slack #devops-alerts.',
    icon: FileText,
  },
  {
    title: 'Incident Alert & Triage',
    prompt: 'When a critical webhook alert arrives, classify the severity with AI reasoning, post an urgent alert to Discord, and dispatch an email notification to the on-call operator.',
    icon: Zap,
  },
  {
    title: 'Daily Operations Sync',
    prompt: 'Every morning at 9 AM, fetch unread emails, summarize key action items using AI, log the audit row into Google Sheets, and send a summary email.',
    icon: Bell,
  },
];

export default function PromptInputPanel({ onGenerated }) {
  const [promptText, setPromptText] = useState('');
  const { generateFromPrompt, isGenerating } = useWorkflowStore();

  const handleGenerate = async (textToUse) => {
    const prompt = textToUse || promptText;
    if (!prompt.trim() || isGenerating) return;

    try {
      const generated = await generateFromPrompt(prompt);
      if (onGenerated) onGenerated(generated);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    }
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 shadow-lg shadow-brand-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">AI Workflow Compiler</h2>
          <p className="text-xs text-slate-400">Describe your multi-agent automation in natural English</p>
        </div>
      </div>

      {/* Main Prompt Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g. When a new email arrives in Gmail, extract the data using AI, log the record to Google Sheets, and notify the team on Slack..."
          className="w-full px-4 py-3 bg-dark-850 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none font-sans leading-relaxed"
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-[11px] text-slate-500">
            Supports OpenRouter (Claude-3.5) • Google Gemini • Deterministic Fallback
          </span>
          <button
            onClick={() => handleGenerate(promptText)}
            disabled={!promptText.trim() || isGenerating}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling Multi-Agent Graph...
              </>
            ) : (
              <>
                Generate Workflow Graph
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Or Select a Production Automation Template
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROMPT_PRESETS.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  setPromptText(preset.prompt);
                  handleGenerate(preset.prompt);
                }}
                className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 hover:border-brand-500/50 hover:bg-dark-800 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-brand-400" />
                  <h4 className="text-xs font-semibold text-white group-hover:text-brand-300">
                    {preset.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
