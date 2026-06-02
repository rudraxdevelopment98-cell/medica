import { create } from 'zustand';
import { authService } from '../services/authService';
import type { AuthState, UserProfile } from '../types';

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loadSession: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile> & { id: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  loadSession: async () => {
    try {
      set({ isLoading: true });
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ user: session.user, profile, isInitialized: true, isLoading: false });
      } else {
        set({ user: null, profile: null, isInitialized: true, isLoading: false });
      }
    } catch {
      set({ isInitialized: true, isLoading: false, error: 'Failed to load session' });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authService.signIn(email, password);
      const profile = data.user ? await authService.getProfile(data.user.id) : null;
      set({ user: data.user, profile, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  signUp: async (email, password, fullName) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authService.signUp(email, password, fullName);
      set({ user: data.user ?? null, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();
      set({ user: null, profile: null, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await authService.resetPassword(email);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset password failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateProfile: async (profile) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await authService.upsertProfile(profile);
      set({ profile: updated, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update profile failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
