import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';

interface ScheduleBuilderProps {
  times: string[];
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  daysOfWeek?: number[];
  onToggleDay?: (day: number) => void;
  showDays?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduleBuilder({
  times,
  onAddTime,
  onRemoveTime,
  daysOfWeek = [],
  onToggleDay,
  showDays = false,
}: ScheduleBuilderProps) {
  const { theme } = useTheme();

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>Reminder Times</Text>
      {times.map((time, index) => (
        <View
          key={index}
          style={[styles.timeRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
        >
          <Ionicons name="time-outline" size={16} color={theme.text.secondary} />
          <Text style={[styles.timeText, { color: theme.text.primary }]}>{time}</Text>
          <TouchableOpacity onPress={() => onRemoveTime(index)}>
            <Ionicons name="trash-outline" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={onAddTime}
        style={[styles.addButton, { borderColor: theme.primary }]}
      >
        <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
        <Text style={[styles.addText, { color: theme.primary }]}>Add Time</Text>
      </TouchableOpacity>

      {showDays && onToggleDay && (
        <>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary, marginTop: Spacing.md }]}>
            Days of Week
          </Text>
          <View style={styles.daysRow}>
            {DAYS.map((day, index) => {
              const isSelected = daysOfWeek.includes(index);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => onToggleDay(index)}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isSelected ? '#FFFFFF' : theme.text.secondary },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  timeText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  addText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  dayButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  dayText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});
