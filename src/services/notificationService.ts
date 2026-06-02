import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Medication, MedicationSchedule, Appointment } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medications', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointment Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleMedicationReminder(
    medication: Medication,
    schedule: MedicationSchedule
  ): Promise<string> {
    const [hours, minutes] = schedule.time_of_day.split(':').map(Number);
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `Time to take ${medication.name} ${medication.dosage}`,
        data: { medicationId: medication.id, scheduleId: schedule.id, type: 'medication' },
        sound: 'default',
      },
      trigger,
    });
    return id;
  },

  async scheduleAppointmentReminder(appointment: Appointment): Promise<string> {
    const appointmentDate = new Date(appointment.appointment_date);
    const reminderDate = new Date(
      appointmentDate.getTime() - appointment.reminder_minutes_before * 60 * 1000
    );

    if (reminderDate <= new Date()) return '';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Appointment Reminder',
        body: `${appointment.title}${appointment.doctor_name ? ` with ${appointment.doctor_name}` : ''} in ${appointment.reminder_minutes_before} minutes`,
        data: { appointmentId: appointment.id, type: 'appointment' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
    return id;
  },

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getScheduledNotifications() {
    return Notifications.getAllScheduledNotificationsAsync();
  },
};
