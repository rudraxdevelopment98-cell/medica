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
import { useMedicationStore } from '../../src/stores/medicationStore';
import { useTheme } from '../../src/hooks/useTheme';
import { notificationService } from '../../src/services/notificationService';
import { Button, Input, Card } from '../../src/components/ui';
import { ScheduleBuilder } from '../../src/components/medications/ScheduleBuilder';
import { MedicationColors } from '../../src/constants/config';
import { Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import type { MedicationForm, MedicationFrequency } from '../../src/types';

const FORMS: MedicationForm[] = ['tablet', 'capsule', 'liquid', 'injection', 'topical', 'inhaler', 'drops', 'other'];
const FREQUENCIES: MedicationFrequency[] = ['daily', 'weekly', 'custom', 'as_needed'];

export default function NewMedicationScreen() {
  const { user } = useAuthStore();
  const { addMedication, addSchedule } = useMedicationStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [frequency, setFrequency] = useState<MedicationFrequency>('daily');
  const [instructions, setInstructions] = useState('');
  const [color, setColor] = useState(MedicationColors[0]);
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  const [times, setTimes] = useState(['08:00']);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Medication name is required';
    if (!dosage.trim()) e.dosage = 'Dosage is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    setIsLoading(true);
    try {
      const medication = await addMedication({
        user_id: user.id,
        name: name.trim(),
        dosage: dosage.trim(),
        form,
        frequency,
        instructions: instructions.trim() || null,
        color,
        is_active: true,
        start_date: startDate,
        end_date: null,
        refill_reminder_days: null,
        current_supply: null,
      });

      // Create schedules and notifications
      if (frequency !== 'as_needed') {
        await Promise.all(
          times.map(async (time) => {
            const schedule = await addSchedule({
              medication_id: medication.id,
              time_of_day: time,
              days_of_week: frequency === 'weekly' ? daysOfWeek : null,
              notification_id: null,
              is_active: true,
            });
            const notificationId = await notificationService
              .scheduleMedicationReminder(medication, schedule)
              .catch(() => null);
            if (notificationId) {
              // Update schedule with notification id would happen here
            }
          })
        );
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save medication');
    } finally {
      setIsLoading(false);
    }
  };

  const addTime = () => {
    setTimes([...times, '12:00']);
  };

  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>New Medication</Text>
        <Button label="Save" onPress={handleSave} isLoading={isLoading} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Basic Info</Text>

          <Input
            label="Medication Name"
            placeholder="e.g., Aspirin"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Input
            label="Dosage"
            placeholder="e.g., 100mg"
            value={dosage}
            onChangeText={setDosage}
            error={errors.dosage}
          />

          <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Form</Text>
          <View style={styles.chipRow}>
            {FORMS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setForm(f)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: form === f ? theme.primary : theme.surfaceSecondary,
                    borderColor: form === f ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: form === f ? '#FFF' : theme.text.secondary }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Instructions (optional)"
            placeholder="e.g., Take with food"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={2}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Schedule</Text>

          <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Frequency</Text>
          <View style={styles.chipRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFrequency(f)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: frequency === f ? theme.primary : theme.surfaceSecondary,
                    borderColor: frequency === f ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[styles.chipText, { color: frequency === f ? '#FFF' : theme.text.secondary }]}
                >
                  {f.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequency !== 'as_needed' && (
            <ScheduleBuilder
              times={times}
              onAddTime={addTime}
              onRemoveTime={removeTime}
              daysOfWeek={daysOfWeek}
              onToggleDay={toggleDay}
              showDays={frequency === 'weekly' || frequency === 'custom'}
            />
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Color</Text>
          <View style={styles.colorRow}>
            {MedicationColors.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && styles.colorDotSelected,
                ]}
              >
                {color === c && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>
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
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: 'white',
  },
});
