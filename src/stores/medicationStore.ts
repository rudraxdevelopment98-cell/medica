import { create } from 'zustand';
import { medicationService } from '../services/medicationService';
import type { MedicationState, Medication, MedicationSchedule, MedicationLog } from '../types';

interface MedicationActions {
  loadMedications: (userId: string) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => Promise<Medication>;
  updateMedication: (id: string, updates: Partial<Omit<Medication, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  loadSchedules: (medicationId: string) => Promise<void>;
  addSchedule: (schedule: Omit<MedicationSchedule, 'id' | 'created_at'>) => Promise<MedicationSchedule>;
  deleteSchedules: (medicationId: string) => Promise<void>;
  logMedication: (log: Omit<MedicationLog, 'id' | 'created_at'>) => Promise<void>;
  loadLogs: (userId: string, startDate: string, endDate: string) => Promise<void>;
  clearError: () => void;
}

export const useMedicationStore = create<MedicationState & MedicationActions>((set, get) => ({
  medications: [],
  schedules: {},
  logs: [],
  isLoading: false,
  error: null,

  loadMedications: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const medications = await medicationService.getMedications(userId);
      set({ medications, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to load medications' });
    }
  },

  addMedication: async (medication) => {
    try {
      set({ isLoading: true, error: null });
      const created = await medicationService.createMedication(medication);
      set((state) => ({ medications: [...state.medications, created], isLoading: false }));
      return created;
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to add medication' });
      throw err;
    }
  },

  updateMedication: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await medicationService.updateMedication(id, updates);
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? updated : m)),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to update medication' });
      throw err;
    }
  },

  deleteMedication: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await medicationService.deleteMedication(id);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to delete medication' });
      throw err;
    }
  },

  loadSchedules: async (medicationId) => {
    try {
      const schedules = await medicationService.getSchedules(medicationId);
      set((state) => ({ schedules: { ...state.schedules, [medicationId]: schedules } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load schedules' });
    }
  },

  addSchedule: async (schedule) => {
    const created = await medicationService.createSchedule(schedule);
    set((state) => ({
      schedules: {
        ...state.schedules,
        [schedule.medication_id]: [...(state.schedules[schedule.medication_id] ?? []), created],
      },
    }));
    return created;
  },

  deleteSchedules: async (medicationId) => {
    await medicationService.deleteSchedulesByMedication(medicationId);
    set((state) => {
      const updated = { ...state.schedules };
      delete updated[medicationId];
      return { schedules: updated };
    });
  },

  logMedication: async (log) => {
    const created = await medicationService.logMedication(log);
    set((state) => ({ logs: [created, ...state.logs] }));
  },

  loadLogs: async (userId, startDate, endDate) => {
    try {
      set({ isLoading: true });
      const logs = await medicationService.getLogs(userId, startDate, endDate);
      set({ logs, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to load logs' });
    }
  },

  clearError: () => set({ error: null }),
}));
