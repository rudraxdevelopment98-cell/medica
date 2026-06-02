import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Card, Badge, Button } from '../../src/components/ui';
import { Spacing, Typography } from '../../src/constants/theme';
import type { BadgeVariant } from '../../src/types';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'warning',
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, deleteAppointment, updateAppointment } = useAppointmentStore();
  const { theme } = useTheme();
  const router = useRouter();

  const appointment = appointments.find((a) => a.id === id);

  const handleDelete = () => {
    Alert.alert('Delete Appointment', 'Remove this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          await deleteAppointment(id);
          router.back();
        },
      },
    ]);
  };

  if (!appointment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <Text style={{ color: theme.text.secondary }}>Appointment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(appointment.appointment_date);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {appointment.title}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="calendar" size={28} color={theme.primary} />
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.appointmentTitle, { color: theme.text.primary }]}>
                {appointment.title}
              </Text>
              <Badge
                label={appointment.status}
                variant={STATUS_VARIANT[appointment.status] ?? 'default'}
              />
            </View>
          </View>
        </Card>

        <Card>
          <DetailRow
            icon="calendar-outline"
            label="Date"
            value={date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            theme={theme}
          />
          <DetailRow
            icon="time-outline"
            label="Time"
            value={date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            theme={theme}
          />
          {appointment.doctor_name && (
            <DetailRow
              icon="person-outline"
              label="Doctor"
              value={`${appointment.doctor_name}${appointment.specialty ? ` (${appointment.specialty})` : ''}`}
              theme={theme}
            />
          )}
          {appointment.location && (
            <DetailRow icon="location-outline" label="Location" value={appointment.location} theme={theme} />
          )}
          <DetailRow
            icon="alarm-outline"
            label="Reminder"
            value={`${appointment.reminder_minutes_before} minutes before`}
            theme={theme}
          />
        </Card>

        {appointment.notes && (
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Notes</Text>
            <Text style={[styles.notes, { color: theme.text.primary }]}>{appointment.notes}</Text>
          </Card>
        )}

        {appointment.status === 'scheduled' && (
          <View style={styles.actions}>
            <Button
              label="Mark as Completed"
              variant="primary"
              onPress={() => updateAppointment(appointment.id, { status: 'completed' })}
              fullWidth
            />
            <Button
              label="Cancel Appointment"
              variant="danger"
              onPress={() => updateAppointment(appointment.id, { status: 'cancelled' })}
              fullWidth
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={theme.text.tertiary} />
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: theme.text.tertiary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.text.primary }]}>{value}</Text>
      </View>
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
  title: { flex: 1, fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  heroCard: { marginBottom: 0 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: { flex: 1, gap: Spacing.xs },
  appointmentTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.xs },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: Typography.fontSize.xs },
  detailValue: { fontSize: Typography.fontSize.md },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  notes: { fontSize: Typography.fontSize.md },
  actions: { marginTop: Spacing.sm },
});
