import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = false,
  height = 8,
  color,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const barColor = color ?? theme.primary;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && (
            <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: theme.text.primary }]}>
              {clampedProgress}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          { backgroundColor: theme.surfaceSecondary, height, borderRadius: height / 2 },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: barColor,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
  },
  percentage: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {},
});
