import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  GitFork,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bot,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', href: '/workflows', icon: GitFork },
  { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'AI' },
  { name: 'Executions', href: '/executions', icon: PlayCircle },
  { name: 'Integrations', href: '/integrations', icon: Puzzle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col shrink-0 z-20">
      {/* Brand Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-dark-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
            Agentflow <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium tracking-tight">Multi-Agent Ops Platform</span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Agent Substrate Status Box */}
      <div className="p-4 m-3 rounded-xl bg-dark-850 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">5-Agent Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Planner • Execution • Validation • Recovery • Monitoring
        </p>
      </div>
    </aside>
  );
}
