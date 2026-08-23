import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, LogOut, Shield, User as UserIcon, Activity } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Header({ onOpenNotifications }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState('healthy');

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?unreadOnly=true&limit=10');
        setUnreadCount(res.data.data?.length || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-dark-900 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-10">
      {/* Active Area / System Heartbeat */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Activity className="w-3.5 h-3.5" />
          <span>System Online</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/40">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Badge & Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-white block leading-tight">{user?.name || 'Operator'}</span>
              <span className="text-[10px] text-brand-400 font-mono capitalize">{user?.role || 'operator'}</span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-850 border border-slate-800 rounded-xl shadow-2xl py-2 z-30">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase">
                  Role: {user?.role || 'operator'}
                </span>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-dark-800 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                Security & Keys
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-dark-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
