import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVitalStore } from '../../src/stores/vitalStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui';
import { VitalUnits } from '../../src/constants/config';
import { Spacing, Typography } from '../../src/constants/theme';
import type { Vital } from '../../src/types';

export default function VitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vitals, deleteVital } = useVitalStore();
  const { theme } = useTheme();
  const router = useRouter();

  const vital = vitals.find((v) => v.id === id);

  const handleDelete = () => {
    Alert.alert('Delete Vital', 'Remove this vital reading?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          await deleteVital(id);
          router.back();
        },
      },
    ]);
  };

  if (!vital) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <Text style={{ color: theme.text.secondary }}>Vital not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = VitalUnits[vital.type];
  const valueDisplay =
    vital.type === 'blood_pressure' && vital.value_secondary != null
      ? `${vital.value_primary}/${vital.value_secondary}`
      : `${vital.value_primary}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {config?.label ?? vital.type}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.heroCard}>
          <Text style={[styles.heroValue, { color: theme.primary }]}>
            {valueDisplay}
            <Text style={[styles.heroUnit, { color: theme.text.secondary }]}> {vital.unit}</Text>
          </Text>
          <Text style={[styles.heroDate, { color: theme.text.tertiary }]}>
            {new Date(vital.measured_at).toLocaleString()}
          </Text>
        </Card>

        {vital.notes && (
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Notes</Text>
            <Text style={[styles.notes, { color: theme.text.primary }]}>{vital.notes}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  title: { flex: 1, fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  heroCard: { alignItems: 'center', padding: Spacing.xl },
  heroValue: { fontSize: 56, fontWeight: Typography.fontWeight.bold },
  heroUnit: { fontSize: Typography.fontSize.xxl },
  heroDate: { fontSize: Typography.fontSize.sm, marginTop: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  notes: { fontSize: Typography.fontSize.md },
});
