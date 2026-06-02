import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabase';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    store.loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { authService } = await import('../services/authService');
        const profile = await authService.getProfile(session.user.id).catch(() => null);
        useAuthStore.setState({ user: session.user, profile, isInitialized: true });
      } else {
        useAuthStore.setState({ user: null, profile: null, isInitialized: true });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return store;
}
