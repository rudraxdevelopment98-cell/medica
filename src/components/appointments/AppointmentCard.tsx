import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../ui';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Typography } from '../../constants/theme';
import type { Appointment, BadgeVariant } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  onDelete?: () => void;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'error',
  rescheduled: 'warning',
};

export function AppointmentCard({ appointment, onPress, onDelete }: AppointmentCardProps) {
  const { theme } = useTheme();

  const date = new Date(appointment.appointment_date);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
              {appointment.title}
            </Text>
            <Badge
              label={appointment.status}
              variant={STATUS_VARIANT[appointment.status] ?? 'default'}
            />
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.text.tertiary} />
            <Text style={[styles.detailText, { color: theme.text.secondary }]}>
              {dateLabel} at {timeLabel}
            </Text>
          </View>

          {appointment.doctor_name && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color={theme.text.tertiary} />
              <Text style={[styles.detailText, { color: theme.text.secondary }]}>
                {appointment.doctor_name}
                {appointment.specialty ? ` • ${appointment.specialty}` : ''}
              </Text>
            </View>
          )}

          {appointment.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={theme.text.tertiary} />
              <Text style={[styles.detailText, { color: theme.text.secondary }]} numberOfLines={1}>
                {appointment.location}
              </Text>
            </View>
          )}
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  details: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  deleteBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.xs,
  },
});
