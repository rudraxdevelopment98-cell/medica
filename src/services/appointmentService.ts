import { supabase } from './supabase';
import type { Appointment } from '../types';

export const appointmentService = {
  async getAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getAppointment(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointment(
    id: string,
    updates: Partial<Omit<Appointment, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },

  async getUpcoming(userId: string, limit = 5): Promise<Appointment[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('appointment_date', now)
      .order('appointment_date', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
