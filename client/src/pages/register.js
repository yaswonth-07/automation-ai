import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Bot, Mail, Lock, User, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const res = await register(name, email, password, role);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setFormError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 ring-1 ring-white/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Register Account</h1>
          <p className="text-xs text-slate-400 mt-1">Create an operator credentials for Agentflow AI</p>
        </div>

        {(formError || error) && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
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
                placeholder="Minimum 6 characters"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Role Separation</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('operator')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === 'operator'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-300 ring-1 ring-brand-500'
                    : 'bg-dark-850 border-slate-800 text-slate-400 hover:bg-dark-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Operator
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  role === 'admin'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-300 ring-1 ring-brand-500'
                    : 'bg-dark-850 border-slate-800 text-slate-400 hover:bg-dark-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Administrator
              </button>
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
                Creating Profile...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
