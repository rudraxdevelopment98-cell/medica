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
import { useMedicationStore } from '../../src/stores/medicationStore';
import { useTheme } from '../../src/hooks/useTheme';
import { MedicationCard } from '../../src/components/medications/MedicationCard';
import { Spacing, Typography } from '../../src/constants/theme';

export default function MedicationsScreen() {
  const { user } = useAuthStore();
  const { medications, isLoading, loadMedications } = useMedicationStore();
  const { theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) loadMedications(user.id);
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await loadMedications(user.id);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Medications</Text>
        <TouchableOpacity
          onPress={() => router.push('/medications/new')}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <MedicationCard
              medication={item}
              onPress={() => router.push(`/medications/${item.id}`)}
              showActions
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="medical-outline" size={64} color={theme.text.tertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                No Medications Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
                Add your first medication to get started with reminders
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/medications/new')}
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.emptyBtnText}>Add Medication</Text>
              </TouchableOpacity>
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
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingTop: 0 },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
  },
  emptyBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
