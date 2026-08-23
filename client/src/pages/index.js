import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
  Bot,
  Sparkles,
  ArrowRight,
  GitFork,
  Zap,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const agents = [
    {
      title: 'Planner Agent',
      desc: 'Formulates node DAG sequences, validates topological ordering, and computes execution confidence.',
      icon: Layers,
      color: 'from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30',
    },
    {
      title: 'Execution Agent',
      desc: 'Executes individual steps against real OAuth endpoints (Gmail, Slack, Sheets) and AI models.',
      icon: Play,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Validation Agent',
      desc: 'Performs schema validation and output verification before dispatching data downstream.',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Recovery Agent',
      desc: 'Classifies failure modes (RATE_LIMIT, AUTH_EXPIRED, MISSING_FIELDS) and executes self-healing retries.',
      icon: RotateCcw,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Monitoring Agent',
      desc: 'Streams real-time execution events to the browser over Socket.IO and maintains MongoDB audit logs.',
      icon: Activity,
      color: 'from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-dark-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
            Agentflow <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            Open Console
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-4 h-4" />
          Next-Gen AI Operations Automation
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15]">
          Turn Natural Language into <br />
          <span className="bg-gradient-to-r from-brand-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            Executable Multi-Agent Workflows
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Describe any operations workflow in plain English. Agentflow compiles it into a visual graph,
          coordinates a 5-agent execution chain, connects with Gmail, Slack, Discord & Google Sheets,
          and streams real-time auditing events.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all group"
          >
            Launch Free Operator Console
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all"
          >
            Demo Operator Login
          </Link>
        </div>

        {/* 5-Agent Architecture Showcase */}
        <section className="mt-24 max-w-6xl w-full text-left">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 font-mono mb-2">
              Autonomous Agentic Orchestration
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              Every workflow runs through a cooperating 5-agent pipeline
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {agents.map((agent, idx) => {
              const Icon = agent.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl bg-dark-900 border ${agent.color.split(' ')[2]} backdrop-blur-md shadow-lg flex flex-col justify-between hover:scale-105 transition-all`}
                >
                  <div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${agent.color.split(' ').slice(0, 2).join(' ')} w-fit mb-3 border border-white/10`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{agent.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Autonomous Stage {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        Agentflow AI • Autonomous Operations Automation Platform • 2026
      </footer>
    </div>
  );
}
