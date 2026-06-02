import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabase';
import { authService } from '../services/authService';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    store.loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
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
