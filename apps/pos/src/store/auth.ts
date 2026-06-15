import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@poscoffe/types';
import { api } from '../lib/api';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.login(email, password);
          set({
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            loading: false,
          });
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : 'Error de login' });
        }
      },
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'poscoffe-auth' },
  ),
);
