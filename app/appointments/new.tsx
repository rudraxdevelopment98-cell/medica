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
import { useAppointmentStore } from '../../src/stores/appointmentStore';
import { useTheme } from '../../src/hooks/useTheme';
import { notificationService } from '../../src/services/notificationService';
import { Button, Input, Card } from '../../src/components/ui';
import { Spacing, Typography } from '../../src/constants/theme';

export default function NewAppointmentScreen() {
  const { user } = useAuthStore();
  const { addAppointment } = useAppointmentStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!appointmentDate.trim()) e.appointmentDate = 'Date and time is required';
    else {
      const d = new Date(appointmentDate);
      if (isNaN(d.getTime())) e.appointmentDate = 'Invalid date format (use YYYY-MM-DDTHH:MM)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    setIsLoading(true);
    try {
      const appointment = await addAppointment({
        user_id: user.id,
        title: title.trim(),
        doctor_name: doctorName.trim() || null,
        specialty: specialty.trim() || null,
        location: location.trim() || null,
        appointment_date: new Date(appointmentDate).toISOString(),
        duration_minutes: 30,
        status: 'scheduled',
        notes: notes.trim() || null,
        reminder_minutes_before: parseInt(reminderMinutes, 10) || 30,
        notification_id: null,
      });

      const notificationId = await notificationService
        .scheduleAppointmentReminder(appointment)
        .catch(() => null);

      if (notificationId) {
        // Store notification id
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save appointment');
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
        <Text style={[styles.title, { color: theme.text.primary }]}>New Appointment</Text>
        <Button label="Save" onPress={handleSave} isLoading={isLoading} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <Input
            label="Title"
            placeholder="e.g., Annual Check-up"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            leftIcon="medical-outline"
          />

          <Input
            label="Doctor Name (optional)"
            placeholder="Dr. Jane Smith"
            value={doctorName}
            onChangeText={setDoctorName}
            leftIcon="person-outline"
          />

          <Input
            label="Specialty (optional)"
            placeholder="e.g., Cardiology"
            value={specialty}
            onChangeText={setSpecialty}
            leftIcon="ribbon-outline"
          />

          <Input
            label="Location (optional)"
            placeholder="Hospital / clinic address"
            value={location}
            onChangeText={setLocation}
            leftIcon="location-outline"
          />

          <Input
            label="Date & Time"
            placeholder="YYYY-MM-DDTHH:MM e.g. 2025-03-15T09:30"
            value={appointmentDate}
            onChangeText={setAppointmentDate}
            leftIcon="calendar-outline"
            error={errors.appointmentDate}
          />

          <Input
            label="Reminder (minutes before)"
            placeholder="30"
            value={reminderMinutes}
            onChangeText={setReminderMinutes}
            keyboardType="numeric"
            leftIcon="alarm-outline"
          />

          <Input
            label="Notes (optional)"
            placeholder="Any preparation notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
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
  scroll: { padding: Spacing.lg },
});
