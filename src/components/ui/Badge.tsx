import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import type { BadgeVariant } from '../../types';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: theme.successLight, text: theme.success };
      case 'warning': return { bg: theme.warningLight, text: theme.warning };
      case 'error': return { bg: theme.errorLight, text: theme.error };
      case 'info': return { bg: theme.primaryLight, text: theme.primary };
      default: return { bg: theme.surfaceSecondary, text: theme.text.secondary };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
});
