import { create } from 'zustand';
import apiClient from '../api';

interface User {
  userId: string;
  email: string;
  name?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({ token });
      get().me();
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      set({
        token: accessToken,
        user,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Login başarısız';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, token: null });
      window.location.href = '/login';
    }
  },

  me: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data.data });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, token: null });
    }
  },
}));
