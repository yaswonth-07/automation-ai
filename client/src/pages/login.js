import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Bot, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('operator@agentflow.local');
  const [password, setPassword] = useState('operator123');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const redirect = router.query.redirect || '/dashboard';
      router.push(redirect);
    } else {
      setFormError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 ring-1 ring-white/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Operator Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">Access your Agentflow AI orchestration console</p>
        </div>

        {/* Error Alert */}
        {(formError || error) && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Operator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Enter Platform
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Info & Register link */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-semibold">
              Register Operator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
