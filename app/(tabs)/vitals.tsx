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
import { useVitalStore } from '../../src/stores/vitalStore';
import { useTheme } from '../../src/hooks/useTheme';
import { VitalCard } from '../../src/components/vitals/VitalCard';
import { Spacing, Typography } from '../../src/constants/theme';
import type { VitalType } from '../../src/types';

const VITAL_FILTERS: { label: string; value: VitalType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'BP', value: 'blood_pressure' },
  { label: 'HR', value: 'heart_rate' },
  { label: 'Weight', value: 'weight' },
  { label: 'Sugar', value: 'blood_sugar' },
  { label: 'SpO2', value: 'spo2' },
];

export default function VitalsScreen() {
  const { user } = useAuthStore();
  const { vitals, isLoading, loadVitals, deleteVital } = useVitalStore();
  const { theme } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<VitalType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadVitals(user.id, filter === 'all' ? undefined : filter);
    }
  }, [user, filter]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await loadVitals(user.id, filter === 'all' ? undefined : filter);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Vitals</Text>
        <TouchableOpacity
          onPress={() => router.push('/vitals/new')}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {VITAL_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.value ? theme.primary : theme.surfaceSecondary,
                borderColor: filter === f.value ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.value ? '#FFFFFF' : theme.text.secondary },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={vitals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <VitalCard
              vital={item}
              onPress={() => router.push(`/vitals/${item.id}`)}
              onDelete={() => deleteVital(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={64} color={theme.text.tertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Vitals Yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
                Start tracking your health metrics
              </Text>
            </View>
          }
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
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: Typography.fontSize.xxl, fontWeight: Typography.fontWeight.bold },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  filterText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingTop: 0 },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.semibold },
  emptySubtitle: { fontSize: Typography.fontSize.md, textAlign: 'center' },
});
