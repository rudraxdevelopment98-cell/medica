import { create } from 'zustand';
import { appointmentService } from '../services/appointmentService';
import type { AppointmentState, Appointment } from '../types';

interface AppointmentActions {
  loadAppointments: (userId: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Omit<Appointment, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useAppointmentStore = create<AppointmentState & AppointmentActions>((set) => ({
  appointments: [],
  isLoading: false,
  error: null,

  loadAppointments: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const appointments = await appointmentService.getAppointments(userId);
      set({ appointments, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to load appointments' });
    }
  },

  addAppointment: async (appointment) => {
    try {
      set({ isLoading: true, error: null });
      const created = await appointmentService.createAppointment(appointment);
      set((state) => ({ appointments: [...state.appointments, created], isLoading: false }));
      return created;
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to add appointment' });
      throw err;
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await appointmentService.updateAppointment(id, updates);
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to update appointment' });
      throw err;
    }
  },

  deleteAppointment: async (id) => {
    try {
      await appointmentService.deleteAppointment(id);
      set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete appointment' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
