import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/hooks/useTheme';
import { Avatar, Button, Input, Card } from '../src/components/ui';
import { Spacing, Typography } from '../src/constants/theme';

export default function ProfileScreen() {
  const { user, profile, updateProfile, signOut, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? '');
  const [bloodType, setBloodType] = useState(profile?.blood_type ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        id: user.id,
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        date_of_birth: dateOfBirth.trim() || null,
        blood_type: bloodType.trim() || null,
      });
      Alert.alert('Success', 'Profile updated');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>Profile</Text>
        <Button label="Save" onPress={handleSave} isLoading={isSaving} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={80} />
          <Text style={[styles.email, { color: theme.text.secondary }]}>{user?.email}</Text>
        </View>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Personal Info</Text>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            leftIcon="person-outline"
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />
          <Input
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            leftIcon="calendar-outline"
          />
          <Input
            label="Blood Type"
            value={bloodType}
            onChangeText={setBloodType}
            placeholder="e.g., A+"
            leftIcon="water-outline"
          />
        </Card>

        <Button
          label="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          fullWidth
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  avatarSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  email: { fontSize: Typography.fontSize.md },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  signOutBtn: { marginTop: Spacing.md },
});
