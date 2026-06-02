import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../ui';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Typography } from '../../constants/theme';
import type { Medication, BadgeVariant } from '../../types';

interface MedicationCardProps {
  medication: Medication;
  onPress?: () => void;
  onTake?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
}

export function MedicationCard({
  medication,
  onPress,
  onTake,
  onSkip,
  showActions = false,
}: MedicationCardProps) {
  const { theme } = useTheme();

  const frequencyLabel: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    custom: 'Custom',
    as_needed: 'As Needed',
  };

  const formLabel: Record<string, string> = {
    tablet: 'Tablet',
    capsule: 'Capsule',
    liquid: 'Liquid',
    injection: 'Injection',
    topical: 'Topical',
    inhaler: 'Inhaler',
    drops: 'Drops',
    other: 'Other',
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: medication.color ?? theme.primary },
            ]}
          />
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
              {medication.name}
            </Text>
            <Text style={[styles.dosage, { color: theme.text.secondary }]}>
              {medication.dosage} • {formLabel[medication.form] ?? medication.form}
            </Text>
          </View>
          <Badge
            label={frequencyLabel[medication.frequency] ?? medication.frequency}
            variant="info"
          />
        </View>

        {medication.instructions && (
          <Text style={[styles.instructions, { color: theme.text.tertiary }]} numberOfLines={2}>
            {medication.instructions}
          </Text>
        )}

        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onTake}
              style={[styles.actionBtn, { backgroundColor: theme.successLight }]}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
              <Text style={[styles.actionText, { color: theme.success }]}>Taken</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSkip}
              style={[styles.actionBtn, { backgroundColor: theme.warningLight }]}
            >
              <Ionicons name="close-circle-outline" size={16} color={theme.warning} />
              <Text style={[styles.actionText, { color: theme.warning }]}>Skip</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  dosage: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  instructions: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 99,
    gap: 4,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
