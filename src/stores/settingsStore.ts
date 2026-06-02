import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SettingsState, Theme, Language, NotificationSettings, SecuritySettings } from '../types';

const SETTINGS_KEY = '@medica/settings';

const defaultSettings: SettingsState = {
  theme: 'system',
  language: 'en',
  notifications: {
    enabled: true,
    medicationReminders: true,
    appointmentReminders: true,
    refillReminders: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  },
  security: {
    biometricEnabled: false,
    pinEnabled: false,
    autoLockMinutes: 5,
    hideDataOnBackground: true,
  },
};

interface SettingsActions {
  loadSettings: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  updateNotifications: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateSecurity: (settings: Partial<SecuritySettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  ...defaultSettings,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SettingsState>;
        set({ ...defaultSettings, ...parsed });
      }
    } catch {
      // use defaults
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), theme }));
  },

  setLanguage: async (language) => {
    set({ language });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), language }));
  },

  updateNotifications: async (notifications) => {
    const updated = { ...get().notifications, ...notifications };
    set({ notifications: updated });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), notifications: updated }));
  },

  updateSecurity: async (security) => {
    const updated = { ...get().security, ...security };
    set({ security: updated });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), security: updated }));
  },
}));
