import { GitFork, CheckCircle2, PlayCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

export default function MetricGrid({ stats }) {
  const metrics = [
    {
      title: 'Total Workflows',
      value: stats?.totalWorkflows ?? 0,
      subtext: `${stats?.activeWorkflows ?? 0} active in production`,
      icon: GitFork,
      color: 'from-blue-500/20 to-indigo-500/10',
      textColor: 'text-blue-400',
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate ?? 100}%`,
      subtext: `${stats?.successfulRuns ?? 0} of ${stats?.totalRuns ?? 0} runs passed`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Total Executions',
      value: stats?.totalRuns ?? 0,
      subtext: `${stats?.failedRuns ?? 0} failures handled by recovery`,
      icon: PlayCircle,
      color: 'from-purple-500/20 to-pink-500/10',
      textColor: 'text-purple-400',
    },
    {
      title: 'Average Latency',
      value: stats?.avgDurationMs ? `${(stats.avgDurationMs / 1000).toFixed(2)}s` : '0.0s',
      subtext: 'Across all 5 multi-agent phases',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/10',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-dark-900 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all"
          >
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${m.color} blur-xl group-hover:scale-125 transition-transform`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.title}</span>
              <div className={`p-2 rounded-xl bg-dark-800 border border-slate-700/50 ${m.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{m.value}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{m.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
