import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/hooks/useTheme';
import { Card } from '../src/components/ui';
import { Spacing, Typography } from '../src/constants/theme';

export default function SecurityScreen() {
  const { security, updateSecurity } = useSettingsStore();
  const { theme } = useTheme();
  const router = useRouter();

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('Not Available', 'Biometric authentication is not available on this device');
        return;
      }
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert(
          'No Biometrics',
          'Please enroll a biometric method in your device settings first'
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use PIN',
      });
      if (!result.success) return;
    }
    await updateSecurity({ biometricEnabled: value });
  };

  const AUTO_LOCK_OPTIONS = [1, 5, 15, 30, 60];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>Security & Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Authentication</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="finger-print-outline" size={20} color={theme.primary} />
              <View>
                <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>
                  Biometric Lock
                </Text>
                <Text style={[styles.toggleHint, { color: theme.text.tertiary }]}>
                  Face ID / Fingerprint
                </Text>
              </View>
            </View>
            <Switch
              value={security.biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="keypad-outline" size={20} color={theme.primary} />
              <View>
                <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>PIN Lock</Text>
                <Text style={[styles.toggleHint, { color: theme.text.tertiary }]}>
                  4-digit PIN code
                </Text>
              </View>
            </View>
            <Switch
              value={security.pinEnabled}
              onValueChange={(v) => updateSecurity({ pinEnabled: v })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Auto-Lock</Text>
          <Text style={[styles.hint, { color: theme.text.tertiary }]}>
            Lock app after inactivity
          </Text>
          <View style={styles.optionRow}>
            {AUTO_LOCK_OPTIONS.map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => updateSecurity({ autoLockMinutes: mins })}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      security.autoLockMinutes === mins ? theme.primary : theme.surfaceSecondary,
                    borderColor:
                      security.autoLockMinutes === mins ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: security.autoLockMinutes === mins ? '#FFF' : theme.text.secondary },
                  ]}
                >
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Privacy</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="eye-off-outline" size={20} color={theme.primary} />
              <View>
                <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>
                  Hide Data on Background
                </Text>
                <Text style={[styles.toggleHint, { color: theme.text.tertiary }]}>
                  Blur content when app is backgrounded
                </Text>
              </View>
            </View>
            <Switch
              value={security.hideDataOnBackground}
              onValueChange={(v) => updateSecurity({ hideDataOnBackground: v })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <View style={[styles.disclaimer, { backgroundColor: theme.warningLight }]}>
          <Ionicons name="information-circle-outline" size={18} color={theme.warning} />
          <Text style={[styles.disclaimerText, { color: theme.warning }]}>
            MediCare is a reminder tool, not a medical device. Always consult a qualified healthcare
            professional for medical advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  hint: { fontSize: Typography.fontSize.sm, marginBottom: Spacing.md, marginTop: -Spacing.sm },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  toggleLabel: { fontSize: Typography.fontSize.md },
  toggleHint: { fontSize: Typography.fontSize.xs, marginTop: 1 },
  optionRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 99,
    borderWidth: 1,
  },
  optionText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  disclaimer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: 10,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  disclaimerText: { flex: 1, fontSize: Typography.fontSize.sm, lineHeight: 20 },
});
