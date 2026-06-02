import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { LightTheme, DarkTheme } from '../constants/theme';
import type { AppTheme } from '../constants/theme';

export function useTheme(): { theme: AppTheme; isDark: boolean } {
  const { theme: themeSetting } = useSettingsStore();
  const systemColorScheme = useColorScheme();

  const isDark =
    themeSetting === 'dark' ||
    (themeSetting === 'system' && systemColorScheme === 'dark');

  return {
    theme: isDark ? DarkTheme : LightTheme,
    isDark,
  };
}
