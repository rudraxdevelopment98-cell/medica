import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

// Create a loosely-typed client so our hand-written types work without
// fighting Supabase's strict generic constraints. All service functions
// cast return data to the correct domain types.
export const supabase = createClient(
  Config.supabaseUrl,
  Config.supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
