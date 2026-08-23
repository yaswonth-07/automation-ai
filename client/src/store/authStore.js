import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentflow_token');
    const savedUser = localStorage.getItem('agentflow_user');

    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      if (savedUser) {
        set({ user: JSON.parse(savedUser), token, isAuthenticated: true });
      }
      const res = await api.get('/auth/me');
      set({ user: res.data.data, token, isAuthenticated: true, isLoading: false, error: null });
      localStorage.setItem('agentflow_user', JSON.stringify(res.data.data));
    } catch {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = res.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
