import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Info, Check } from 'lucide-react';
import api from '../../services/api';
import { subscribeToNotifications } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=25');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });
    return unsubscribe;
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'failure':
        return <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
      case 'escalation':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">Operator Inbox</h2>
              <p className="text-xs text-slate-400">Audit alerts and execution events</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                <p>No new notifications</p>
                <p className="text-xs mt-1 text-slate-600">Events from execution runs will appear here in real-time.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id || Math.random()}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-dark-850/60 border-slate-800/60 text-slate-400'
                      : 'bg-dark-800 border-slate-700/80 text-slate-200 shadow-md ring-1 ring-brand-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold truncate text-white">{n.title}</h4>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed break-words">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
