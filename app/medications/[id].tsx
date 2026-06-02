import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMedicationStore } from '../../src/stores/medicationStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Card, Badge, Button } from '../../src/components/ui';
import { medicationService } from '../../src/services/medicationService';
import { Spacing, Typography } from '../../src/constants/theme';
import type { Medication, MedicationSchedule } from '../../src/types';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deleteMedication } = useMedicationStore();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [medication, setMedication] = useState<Medication | null>(null);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [med, scheds] = await Promise.all([
          medicationService.getMedication(id),
          medicationService.getSchedules(id),
        ]);
        setMedication(med);
        setSchedules(scheds);
      } catch {
        Alert.alert('Error', 'Failed to load medication');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication? All schedules and logs will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            await deleteMedication(id);
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!medication) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {medication.name}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View
              style={[styles.colorBadge, { backgroundColor: medication.color ?? theme.primary }]}
            >
              <Ionicons name="medical" size={28} color="#FFF" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.medName, { color: theme.text.primary }]}>{medication.name}</Text>
              <Text style={[styles.medDosage, { color: theme.text.secondary }]}>
                {medication.dosage} • {medication.form}
              </Text>
            </View>
            <Badge
              label={medication.is_active ? 'Active' : 'Inactive'}
              variant={medication.is_active ? 'success' : 'default'}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Details</Text>
          <DetailRow label="Frequency" value={medication.frequency} theme={theme} />
          <DetailRow label="Start Date" value={medication.start_date} theme={theme} />
          {medication.end_date && (
            <DetailRow label="End Date" value={medication.end_date} theme={theme} />
          )}
          {medication.instructions && (
            <DetailRow label="Instructions" value={medication.instructions} theme={theme} />
          )}
        </Card>

        {schedules.length > 0 && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Schedule</Text>
            {schedules.map((s) => (
              <View key={s.id} style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={16} color={theme.text.tertiary} />
                <Text style={[styles.scheduleTime, { color: theme.text.primary }]}>
                  {s.time_of_day}
                </Text>
                {s.days_of_week && (
                  <Text style={[styles.scheduleDays, { color: theme.text.secondary }]}>
                    {s.days_of_week.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        )}

        <Button
          label={medication.is_active ? 'Deactivate Medication' : 'Activate Medication'}
          variant="outline"
          onPress={async () => {
            await medicationService.updateMedication(medication.id, {
              is_active: !medication.is_active,
            });
            setMedication({ ...medication, is_active: !medication.is_active });
          }}
          fullWidth
          style={styles.toggleBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  heroCard: { marginBottom: 0 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  colorBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  medName: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold },
  medDosage: { fontSize: Typography.fontSize.sm, marginTop: 2 },
  section: { marginBottom: 0 },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  detailLabel: { fontSize: Typography.fontSize.sm },
  detailValue: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  scheduleTime: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.medium },
  scheduleDays: { fontSize: Typography.fontSize.sm, flex: 1 },
  toggleBtn: { marginTop: Spacing.sm },
});
