import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'caja' | 'kds' | 'insights';
export type Theme = 'light' | 'dark';

interface UiState {
  view: View;
  theme: Theme;
  setView: (v: View) => void;
  toggleTheme: () => void;
}

/** Aplica/quita la clase `dark` en <html> (Tailwind darkMode: 'class'). */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      view: 'caja',
      theme: 'light',
      setView: (view) => set({ view }),
      toggleTheme: () => {
        const theme = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'poscoffe-ui',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
