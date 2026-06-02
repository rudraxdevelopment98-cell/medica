import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useMedicationStore } from '../../src/stores/medicationStore';
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Card, ProgressBar, Avatar } from '../../src/components/ui';
import { MedicationCard } from '../../src/components/medications/MedicationCard';
import { AppointmentCard } from '../../src/components/appointments/AppointmentCard';
import { medicationService } from '../../src/services/medicationService';
import { appointmentService } from '../../src/services/appointmentService';
import { Spacing, Typography } from '../../src/constants/theme';
import type { AdherenceStats, Appointment } from '../../src/types';

export default function DashboardScreen() {
  const { user, profile } = useAuthStore();
  const { medications, loadMedications } = useMedicationStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [adherence, setAdherence] = useState<AdherenceStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      await loadMedications(user.id);
      const [stats, appointments] = await Promise.all([
        medicationService.getAdherenceStats(user.id, 7),
        appointmentService.getUpcoming(user.id, 3),
      ]);
      setAdherence(stats);
      setUpcomingAppointments(appointments);
    } catch {
      // handle silently
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const todayMeds = medications.filter((m) => m.is_active && m.frequency !== 'as_needed');
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text.secondary }]}>Good morning,</Text>
            <Text style={[styles.name, { color: theme.text.primary }]}>Hi {firstName} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={44} />
          </TouchableOpacity>
        </View>

        {/* Adherence Card */}
        {adherence && (
          <Card style={styles.adherenceCard}>
            <View style={styles.adherenceHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Weekly Adherence
              </Text>
              <Text style={[styles.adherencePercent, { color: theme.primary }]}>
                {adherence.percentage}%
              </Text>
            </View>
            <ProgressBar
              progress={adherence.percentage}
              showPercentage={false}
              height={10}
              color={
                adherence.percentage >= 80
                  ? theme.success
                  : adherence.percentage >= 50
                  ? theme.warning
                  : theme.error
              }
            />
            <View style={styles.adherenceStats}>
              <AdherenceStat label="Taken" value={adherence.taken} color={theme.success} />
              <AdherenceStat label="Skipped" value={adherence.skipped} color={theme.warning} />
              <AdherenceStat label="Missed" value={adherence.missed} color={theme.error} />
            </View>
          </Card>
        )}

        {/* Today's Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Today&apos;s Medications
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/medications')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {todayMeds.length === 0 ? (
            <EmptySection
              icon="medical-outline"
              message="No medications scheduled for today"
              theme={theme}
            />
          ) : (
            todayMeds.slice(0, 3).map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onPress={() => router.push(`/medications/${med.id}`)}
                showActions
              />
            ))
          )}
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Upcoming Appointments
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingAppointments.length === 0 ? (
            <EmptySection
              icon="calendar-outline"
              message="No upcoming appointments"
              theme={theme}
            />
          ) : (
            upcomingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onPress={() => router.push(`/appointments/${appt.id}`)}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle-outline"
              label="Add Medication"
              onPress={() => router.push('/medications/new')}
              theme={theme}
            />
            <QuickAction
              icon="pulse-outline"
              label="Log Vital"
              onPress={() => router.push('/vitals/new')}
              theme={theme}
            />
            <QuickAction
              icon="calendar-outline"
              label="New Appointment"
              onPress={() => router.push('/appointments/new')}
              theme={theme}
            />
            <QuickAction
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push('/settings')}
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AdherenceStat({ label, value, color }: { label: string; value: number; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.adherenceStat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>{label}</Text>
    </View>
  );
}

function EmptySection({
  icon,
  message,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <View style={[styles.emptySection, { backgroundColor: theme.surfaceSecondary }]}>
      <Ionicons name={icon} size={32} color={theme.text.tertiary} />
      <Text style={[styles.emptyText, { color: theme.text.tertiary }]}>{message}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: theme.primaryLight }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.quickActionLabel, { color: theme.text.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { fontSize: Typography.fontSize.sm },
  name: { fontSize: Typography.fontSize.xxl, fontWeight: Typography.fontWeight.bold },
  adherenceCard: { marginBottom: Spacing.lg },
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  adherencePercent: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  adherenceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  adherenceStat: { alignItems: 'center' },
  statValue: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold },
  statLabel: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  seeAll: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  emptySection: {
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: { fontSize: Typography.fontSize.sm, textAlign: 'center' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickAction: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
});
