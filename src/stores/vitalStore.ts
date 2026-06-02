import { create } from 'zustand';
import { vitalService } from '../services/vitalService';
import type { VitalState, Vital, VitalType } from '../types';

interface VitalActions {
  loadVitals: (userId: string, type?: VitalType) => Promise<void>;
  addVital: (vital: Omit<Vital, 'id' | 'created_at'>) => Promise<Vital>;
  deleteVital: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useVitalStore = create<VitalState & VitalActions>((set) => ({
  vitals: [],
  isLoading: false,
  error: null,

  loadVitals: async (userId, type) => {
    try {
      set({ isLoading: true, error: null });
      const vitals = await vitalService.getVitals(userId, type);
      set({ vitals, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to load vitals' });
    }
  },

  addVital: async (vital) => {
    try {
      set({ isLoading: true, error: null });
      const created = await vitalService.createVital(vital);
      set((state) => ({ vitals: [created, ...state.vitals], isLoading: false }));
      return created;
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to add vital' });
      throw err;
    }
  },

  deleteVital: async (id) => {
    try {
      await vitalService.deleteVital(id);
      set((state) => ({ vitals: state.vitals.filter((v) => v.id !== id) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete vital' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
