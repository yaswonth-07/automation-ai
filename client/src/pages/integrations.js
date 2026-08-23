import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Mail,
  MessageSquare,
  Bot,
  Table,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Key,
  RotateCcw,
  Loader2
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';

const INTEGRATION_INFO = {
  gmail: {
    title: 'Gmail API',
    desc: 'Send automated alerts and ingest incoming email triggers',
    icon: Mail,
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'from-rose-500/10 to-pink-500/5',
    scopes: ['gmail.send', 'gmail.readonly'],
  },
  slack: {
    title: 'Slack App Bot',
    desc: 'Broadcast notifications and alerts to specific channels',
    icon: MessageSquare,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'from-emerald-500/10 to-teal-500/5',
    scopes: ['chat:write', 'channels:read'],
  },
  discord: {
    title: 'Discord Bot & Webhooks',
    desc: 'Post incident alerts to guild text channels',
    icon: Bot,
    color: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'from-indigo-500/10 to-purple-500/5',
    scopes: ['bot', 'messages.read'],
  },
  'google-sheets': {
    title: 'Google Sheets API',
    desc: 'Append audit rows and retrieve spreadsheet tabular data',
    icon: Table,
    color: 'text-emerald-500',
    border: 'border-emerald-500/30',
    bg: 'from-emerald-500/10 to-green-500/5',
    scopes: ['spreadsheets', 'drive.file'],
  },
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [manualModal, setManualModal] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      setIntegrations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    if (router.query.connected) {
      fetchIntegrations();
    }
  }, [router.query]);

  const handleOAuthConnect = (provider) => {
    // Redirect to OAuth start endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/integrations/oauth/${provider}/start`;
  };

  const handleDisconnect = async (provider) => {
    setActionLoading(provider);
    try {
      await api.delete(`/integrations/${provider}`);
      fetchIntegrations();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveManual = async (provider) => {
    if (!apiKeyInput.trim()) return;
    setActionLoading(provider);
    try {
      await api.post('/integrations', {
        provider,
        credentials: {
          accessToken: apiKeyInput.trim(),
          scopes: ['all'],
          metadata: { mode: 'manual_token', addedAt: new Date().toISOString() },
        },
      });
      setManualModal(null);
      setApiKeyInput('');
      fetchIntegrations();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Integrations">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Third-Party Integrations</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect external services via OAuth 2.0 with AES-256-GCM encrypted tokens at rest
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-850 border border-slate-800 text-xs font-mono text-emerald-400">
            <Shield className="w-4 h-4" />
            AES-256-GCM Token Encryption Active
          </div>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">Loading integrations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((item) => {
              const meta = INTEGRATION_INFO[item.provider] || {
                title: item.provider,
                desc: 'External Service',
                icon: Shield,
                color: 'text-brand-400',
                border: 'border-slate-800',
                bg: 'from-dark-900 to-dark-850',
                scopes: [],
              };
              const Icon = meta.icon;

              return (
                <div
                  key={item.provider}
                  className={`bg-gradient-to-br ${meta.bg} border ${meta.border} rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 hover:border-slate-600 transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-dark-950 border border-slate-800 ${meta.color} shadow-md`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{meta.title}</h3>
                          <span className="text-[10px] font-mono uppercase text-slate-500">
                            OAuth 2.0 Provider
                          </span>
                        </div>
                      </div>

                      {item.isConnected ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          <XCircle className="w-3.5 h-3.5" />
                          Disconnected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{meta.desc}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {meta.scopes.map((sc) => (
                        <span
                          key={sc}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 border border-slate-800 text-slate-400"
                        >
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    {item.isConnected ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleDisconnect(item.provider)}
                          disabled={actionLoading === item.provider}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                        <button
                          onClick={() => handleOAuthConnect(item.provider)}
                          className="py-2 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reconnect
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleOAuthConnect(item.provider)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Connect via OAuth
                        </button>
                        <button
                          onClick={() => setManualModal(item.provider)}
                          className="py-2.5 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" /> Token
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Manual Token Entry Modal */}
        {manualModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                  Set {manualModal} Token
                </h3>
                <button
                  onClick={() => setManualModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Provide an API token or bot secret. The secret will be immediately encrypted using AES-256-GCM before storage.
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter access token / bot token..."
                className="w-full px-3.5 py-2.5 bg-dark-850 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setManualModal(null)}
                  className="px-4 py-2 rounded-xl bg-dark-850 text-slate-300 text-xs hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveManual(manualModal)}
                  disabled={!apiKeyInput.trim() || actionLoading}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Encrypt & Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
