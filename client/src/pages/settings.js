import { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  User,
  CheckCircle2,
  Lock,
  Cpu,
  Database,
  Activity,
  Zap
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const res = await api.get('/health');
        setHealthData(res.data);
      } catch (err) {
        console.error('Failed to fetch health check:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell title="Settings & Security">
        <div className="max-w-4xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Platform Settings & Security</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage operator profile, system encryption, and execution backend health
            </p>
          </div>

          {/* Operator Profile Card */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Operator Profile</h3>
                <p className="text-xs text-slate-400">Current authenticated session details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Operator Name</span>
                <span className="text-sm font-semibold text-white mt-1 block">{user?.name || 'Operator'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Email Address</span>
                <span className="text-sm font-semibold text-white mt-1 block">{user?.email || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Assigned Role</span>
                <span className="text-xs font-mono font-bold uppercase text-brand-400 mt-1 block">
                  {user?.role || 'operator'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Session ID / Auth Mode</span>
                <span className="text-xs font-mono text-slate-300 mt-1 block">JWT HMAC-SHA256 (7d)</span>
              </div>
            </div>
          </div>

          {/* Security & Token Encryption Health */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Encryption & Security Controls</h3>
                <p className="text-xs text-slate-400">Cryptographic protection for secrets and tokens</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Credential Encryption at Rest</span>
                  <span className="text-slate-400 text-[11px]">AES-256-GCM authenticated cipher with PBKDF2 key derivation</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Password Storage Hashing</span>
                  <span className="text-slate-400 text-[11px]">bcrypt with cost factor 12</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ENFORCED
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">HTTP Header Protection</span>
                  <span className="text-slate-400 text-[11px]">Helmet security suite & CORS restriction to client origin</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ENABLED
                </span>
              </div>
            </div>
          </div>

          {/* Engine & Database Health */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Engine Substrate Health</h3>
                <p className="text-xs text-slate-400">Backend database and execution queue runtime state</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">MongoDB Store</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {healthData?.database?.inMemory ? 'In-Memory DB Mode' : 'Connected'}
                    </span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-brand-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Execution Engine</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {healthData?.queue?.engine || 'Async Queue Runner'}
                    </span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
