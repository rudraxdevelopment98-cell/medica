import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { useTheme } from '../../src/hooks/useTheme';
import { AppointmentCard } from '../../src/components/appointments/AppointmentCard';
import { Spacing, Typography } from '../../src/constants/theme';

export default function AppointmentsScreen() {
  const { user } = useAuthStore();
  const { appointments, isLoading, loadAppointments, deleteAppointment } = useAppointmentStore();
  const { theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) loadAppointments(user.id);
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await loadAppointments(user.id);
    setRefreshing(false);
  };

  const upcoming = appointments.filter((a) => a.status === 'scheduled');
  const past = appointments.filter((a) => a.status !== 'scheduled');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Appointments</Text>
        <TouchableOpacity
          onPress={() => router.push('/appointments/new')}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <>
              {upcoming.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>
                    Upcoming
                  </Text>
                  {upcoming.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onPress={() => router.push(`/appointments/${appt.id}`)}
                      onDelete={() => deleteAppointment(appt.id)}
                    />
                  ))}
                </>
              )}
              {past.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: theme.text.secondary, marginTop: Spacing.md }]}>
                    Past
                  </Text>
                  {past.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onPress={() => router.push(`/appointments/${appt.id}`)}
                      onDelete={() => deleteAppointment(appt.id)}
                    />
                  ))}
                </>
              )}
              {appointments.length === 0 && (
                <View style={styles.empty}>
                  <Ionicons name="calendar-outline" size={64} color={theme.text.tertiary} />
                  <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                    No Appointments
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
                    Schedule your first appointment and get reminders
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={() => null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: Typography.fontSize.xxl, fontWeight: Typography.fontWeight.bold },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingTop: 0 },
  sectionLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, marginBottom: Spacing.sm },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.semibold },
  emptySubtitle: { fontSize: Typography.fontSize.md, textAlign: 'center' },
});
