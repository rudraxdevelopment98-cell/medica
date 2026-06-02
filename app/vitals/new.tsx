import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useVitalStore } from '../../src/stores/vitalStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button, Input, Card } from '../../src/components/ui';
import { VitalUnits } from '../../src/constants/config';
import { Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import type { VitalType } from '../../src/types';

const VITAL_TYPES: VitalType[] = ['blood_pressure', 'heart_rate', 'weight', 'blood_sugar', 'spo2', 'temperature'];

export default function NewVitalScreen() {
  const { user } = useAuthStore();
  const { addVital } = useVitalStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [type, setType] = useState<VitalType>('blood_pressure');
  const [valuePrimary, setValuePrimary] = useState('');
  const [valueSecondary, setValueSecondary] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const config = VitalUnits[type];

  const validate = () => {
    const e: Record<string, string> = {};
    const num = parseFloat(valuePrimary);
    if (!valuePrimary) e.valuePrimary = 'Value is required';
    else if (isNaN(num) || num < config.min || num > config.max) {
      e.valuePrimary = `Value must be between ${config.min} and ${config.max}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    setIsLoading(true);
    try {
      await addVital({
        user_id: user.id,
        type,
        value_primary: parseFloat(valuePrimary),
        value_secondary: valueSecondary ? parseFloat(valueSecondary) : null,
        unit: config.unit,
        notes: notes.trim() || null,
        measured_at: new Date().toISOString(),
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save vital');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>Log Vital</Text>
        <Button label="Save" onPress={handleSave} isLoading={isLoading} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Vital Type</Text>
          <View style={styles.chipRow}>
            {VITAL_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: type === t ? theme.primary : theme.surfaceSecondary,
                    borderColor: type === t ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: type === t ? '#FFF' : theme.text.secondary }]}>
                  {VitalUnits[t]?.label ?? t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Values</Text>
          <Input
            label={type === 'blood_pressure' ? `Systolic (${config.unit})` : `${config.label} (${config.unit})`}
            placeholder={`${config.min}–${config.max}`}
            value={valuePrimary}
            onChangeText={setValuePrimary}
            keyboardType="numeric"
            error={errors.valuePrimary}
          />
          {type === 'blood_pressure' && (
            <Input
              label={`Diastolic (${config.unit})`}
              placeholder="e.g., 80"
              value={valueSecondary}
              onChangeText={setValueSecondary}
              keyboardType="numeric"
            />
          )}
          <Input
            label="Notes (optional)"
            placeholder="Any context or observations"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </Card>
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
  section: { marginBottom: 0 },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
});
