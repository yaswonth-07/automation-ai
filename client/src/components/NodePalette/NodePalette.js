import React from 'react';
import {
  Zap,
  Mail,
  MessageSquare,
  Bot,
  Table,
  Sparkles,
  GitBranch,
  Clock,
  Send,
  Webhook
} from 'lucide-react';

const PALETTE_CATEGORIES = [
  {
    name: 'Triggers',
    items: [
      {
        type: 'triggerNode',
        label: 'Manual Trigger',
        category: 'trigger',
        provider: 'system',
        action: 'manual_trigger',
        description: 'Initiate manually by operator',
        icon: Zap,
        color: 'text-amber-400',
      },
      {
        type: 'triggerNode',
        label: 'Cron Schedule',
        category: 'trigger',
        provider: 'system',
        action: 'cron_trigger',
        params: { cron: '0 9 * * *' },
        description: 'Periodic time-based schedule',
        icon: Clock,
        color: 'text-amber-400',
      },
      {
        type: 'triggerNode',
        label: 'Webhook Trigger',
        category: 'trigger',
        provider: 'system',
        action: 'webhook_trigger',
        params: { method: 'POST', endpoint: '/webhook/v1' },
        description: 'Incoming HTTP payload',
        icon: Webhook,
        color: 'text-amber-400',
      },
      {
        type: 'triggerNode',
        label: 'Gmail New Email',
        category: 'trigger',
        provider: 'gmail',
        action: 'read_emails',
        params: { query: 'is:unread' },
        description: 'Triggers on incoming email',
        icon: Mail,
        color: 'text-rose-400',
      },
    ],
  },
  {
    name: 'AI Agents',
    items: [
      {
        type: 'aiNode',
        label: 'AI Reasoning & Extract',
        category: 'ai',
        provider: 'llm',
        action: 'extract_structured_data',
        params: { instruction: 'Extract entities and summarize payload' },
        description: 'Extract data & reasoning with LLM',
        icon: Sparkles,
        color: 'text-purple-400',
      },
    ],
  },
  {
    name: 'Integrations',
    items: [
      {
        type: 'integrationNode',
        label: 'Send Gmail',
        category: 'integration',
        provider: 'gmail',
        action: 'send_email',
        params: { to: 'operator@agentflow.local', subject: 'Notification', body: 'Execution finished' },
        description: 'Deliver email via Gmail API',
        icon: Mail,
        color: 'text-rose-400',
      },
      {
        type: 'integrationNode',
        label: 'Post Slack Message',
        category: 'integration',
        provider: 'slack',
        action: 'post_message',
        params: { channel: '#devops-alerts', text: 'Alert from Agentflow AI' },
        description: 'Send message to Slack channel',
        icon: MessageSquare,
        color: 'text-emerald-400',
      },
      {
        type: 'integrationNode',
        label: 'Post Discord Message',
        category: 'integration',
        provider: 'discord',
        action: 'post_message',
        params: { channelId: 'ops-feed', content: 'Agentflow AI Bot Notification' },
        description: 'Send message via Discord bot',
        icon: Bot,
        color: 'text-indigo-400',
      },
      {
        type: 'integrationNode',
        label: 'Append Google Sheet',
        category: 'integration',
        provider: 'google-sheets',
        action: 'append_row',
        params: { spreadsheetId: 'ops_audit', range: 'Sheet1!A:E', values: [] },
        description: 'Append row to Google Sheets',
        icon: Table,
        color: 'text-emerald-500',
      },
    ],
  },
  {
    name: 'Logic & Routing',
    items: [
      {
        type: 'logicNode',
        label: 'Conditional Branch',
        category: 'logic',
        provider: 'system',
        action: 'evaluate_condition',
        params: { condition: 'output.confidence > 0.85' },
        description: 'Evaluate rule and route execution',
        icon: GitBranch,
        color: 'text-cyan-400',
      },
    ],
  },
];

export default function NodePalette() {
  const onDragStart = (event, item) => {
    event.dataTransfer.setData('application/agentflow-node', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-dark-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Node Palette</h3>
        <p className="text-[11px] text-slate-500">Drag and drop nodes onto the canvas</p>
      </div>

      {PALETTE_CATEGORIES.map((category) => (
        <div key={category.name} className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
            {category.name}
          </span>
          <div className="space-y-2">
            {category.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => onDragStart(e, item)}
                  className="p-2.5 rounded-xl bg-dark-850 border border-slate-800 hover:border-slate-700 hover:bg-dark-800 cursor-grab active:cursor-grabbing transition-all flex items-start gap-2.5 shadow-sm group"
                >
                  <div className={`p-1.5 rounded-lg bg-dark-900 border border-slate-800 ${item.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-brand-300">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
