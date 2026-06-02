import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Typography } from '../../constants/theme';
import { VitalUnits } from '../../constants/config';
import type { Vital } from '../../types';

interface VitalCardProps {
  vital: Vital;
  onPress?: () => void;
  onDelete?: () => void;
}

const VITAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  blood_pressure: 'heart-outline',
  heart_rate: 'pulse-outline',
  weight: 'barbell-outline',
  blood_sugar: 'water-outline',
  spo2: 'partly-sunny-outline',
  temperature: 'thermometer-outline',
};

export function VitalCard({ vital, onPress, onDelete }: VitalCardProps) {
  const { theme } = useTheme();
  const config = VitalUnits[vital.type];
  const icon = VITAL_ICONS[vital.type] ?? 'analytics-outline';

  const valueDisplay =
    vital.type === 'blood_pressure' && vital.value_secondary != null
      ? `${vital.value_primary}/${vital.value_secondary}`
      : `${vital.value_primary}`;

  const measuredDate = new Date(vital.measured_at);
  const dateLabel = measuredDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name={icon} size={22} color={theme.primary} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.type, { color: theme.text.secondary }]}>
              {config?.label ?? vital.type}
            </Text>
            <View style={styles.valueRow}>
              <Text style={[styles.value, { color: theme.text.primary }]}>{valueDisplay}</Text>
              <Text style={[styles.unit, { color: theme.text.tertiary }]}>{vital.unit}</Text>
            </View>
            <Text style={[styles.date, { color: theme.text.tertiary }]}>{dateLabel}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={theme.error} />
            </TouchableOpacity>
          )}
        </View>
        {vital.notes && (
          <Text style={[styles.notes, { color: theme.text.tertiary }]} numberOfLines={2}>
            {vital.notes}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  type: {
    fontSize: Typography.fontSize.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  unit: {
    fontSize: Typography.fontSize.sm,
  },
  date: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  notes: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
  },
});
