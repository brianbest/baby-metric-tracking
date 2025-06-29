import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@baby-tracker/shared';
// import i18n from 'i18next';

interface SettingsState extends AppSettings {
  isInitialized: boolean;
}

interface SettingsActions {
  setLanguage: (language: 'en-US' | 'zh-CN') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  setActiveBabyId: (babyId: string | undefined) => void;
  initialize: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // State
      language: 'en-US',
      theme: 'dark',
      units: 'metric',
      activeBabyId: undefined,
      isInitialized: false,

      // Actions
      setLanguage: (language) => {
        set({ language });
        
        // Update i18next language
        if (typeof window !== 'undefined') {
          import('i18next').then((i18next) => {
            i18next.default.changeLanguage(language);
          });
        }
      },

      setTheme: (theme) => {
        set({ theme });
        
        // Update CSS custom properties for theme
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      setUnits: (units) => {
        set({ units });
      },

      setActiveBabyId: (activeBabyId) => {
        set({ activeBabyId });
      },

      initialize: () => {
        if (get().isInitialized) return;

        const { theme, language } = get();
        
        // Apply theme
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }

        // Apply language
        if (typeof window !== 'undefined') {
          import('i18next').then((i18next) => {
            i18next.default.changeLanguage(language);
          });
        }

        set({ isInitialized: true });
      },
    }),
    {
      name: 'settings-store',
      onRehydrateStorage: () => (state) => {
        // Initialize settings after rehydration
        if (state) {
          state.initialize();
        }
      },
    }
  )
); 