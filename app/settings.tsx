import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/hooks/useTheme';
import { Card } from '../src/components/ui';
import { Spacing, Typography } from '../src/constants/theme';
import type { Theme } from '../src/types';

const THEMES: { label: string; value: Theme }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export default function SettingsScreen() {
  const { theme: themeSetting, notifications, setTheme, updateNotifications } = useSettingsStore();
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Theme */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Appearance</Text>
          <View style={styles.themeRow}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => setTheme(t.value)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      themeSetting === t.value ? theme.primary : theme.surfaceSecondary,
                    borderColor:
                      themeSetting === t.value ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeText,
                    { color: themeSetting === t.value ? '#FFF' : theme.text.secondary },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notifications */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Notifications</Text>

          <ToggleRow
            label="Enable Notifications"
            value={notifications.enabled}
            onToggle={(v) => updateNotifications({ enabled: v })}
            theme={theme}
          />
          <ToggleRow
            label="Medication Reminders"
            value={notifications.medicationReminders}
            onToggle={(v) => updateNotifications({ medicationReminders: v })}
            theme={theme}
            disabled={!notifications.enabled}
          />
          <ToggleRow
            label="Appointment Reminders"
            value={notifications.appointmentReminders}
            onToggle={(v) => updateNotifications({ appointmentReminders: v })}
            theme={theme}
            disabled={!notifications.enabled}
          />
          <ToggleRow
            label="Refill Reminders"
            value={notifications.refillReminders}
            onToggle={(v) => updateNotifications({ refillReminders: v })}
            theme={theme}
            disabled={!notifications.enabled}
          />
          <ToggleRow
            label="Quiet Hours"
            value={notifications.quietHoursEnabled}
            onToggle={(v) => updateNotifications({ quietHoursEnabled: v })}
            theme={theme}
          />
        </Card>

        {/* Security */}
        <TouchableOpacity onPress={() => router.push('/security')}>
          <Card>
            <View style={styles.linkRow}>
              <View style={[styles.linkIcon, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.linkContent}>
                <Text style={[styles.linkTitle, { color: theme.text.primary }]}>
                  Security & Privacy
                </Text>
                <Text style={[styles.linkSubtitle, { color: theme.text.secondary }]}>
                  Biometric lock, PIN, and privacy settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.text.tertiary} />
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  theme,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  theme: ReturnType<typeof useTheme>['theme'];
  disabled?: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text
        style={[styles.toggleLabel, { color: disabled ? theme.text.tertiary : theme.text.primary }]}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  themeRow: { flexDirection: 'row', gap: Spacing.sm },
  themeOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleLabel: { fontSize: Typography.fontSize.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: { flex: 1 },
  linkTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.medium },
  linkSubtitle: { fontSize: Typography.fontSize.sm, marginTop: 2 },
});
