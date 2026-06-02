import { supabase } from './supabase';
import type { Medication, MedicationSchedule, MedicationLog, AdherenceStats } from '../types';

export const medicationService = {
  async getMedications(userId: string): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data ?? [];
  },

  async getMedication(id: string): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createMedication(
    medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMedication(
    id: string,
    updates: Partial<Omit<Medication, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Medication> {
    const { data, error } = await supabase
      .from('medications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMedication(id: string): Promise<void> {
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (error) throw error;
  },

  async getSchedules(medicationId: string): Promise<MedicationSchedule[]> {
    const { data, error } = await supabase
      .from('medication_schedules')
      .select('*')
      .eq('medication_id', medicationId)
      .order('time_of_day');
    if (error) throw error;
    return data ?? [];
  },

  async createSchedule(
    schedule: Omit<MedicationSchedule, 'id' | 'created_at'>
  ): Promise<MedicationSchedule> {
    const { data, error } = await supabase
      .from('medication_schedules')
      .insert(schedule)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSchedulesByMedication(medicationId: string): Promise<void> {
    const { error } = await supabase
      .from('medication_schedules')
      .delete()
      .eq('medication_id', medicationId);
    if (error) throw error;
  },

  async logMedication(
    log: Omit<MedicationLog, 'id' | 'created_at'>
  ): Promise<MedicationLog> {
    const { data, error } = await supabase
      .from('medication_logs')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLogs(userId: string, startDate: string, endDate: string): Promise<MedicationLog[]> {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_time', startDate)
      .lte('scheduled_time', endDate)
      .order('scheduled_time', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getAdherenceStats(userId: string, days: number = 7): Promise<AdherenceStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('medication_logs')
      .select('status')
      .eq('user_id', userId)
      .gte('scheduled_time', startDate.toISOString());

    if (error) throw error;

    const logs = data ?? [];
    const total = logs.length;
    const taken = logs.filter((l) => l.status === 'taken').length;
    const skipped = logs.filter((l) => l.status === 'skipped').length;
    const missed = logs.filter((l) => l.status === 'missed').length;

    return {
      total,
      taken,
      skipped,
      missed,
      percentage: total > 0 ? Math.round((taken / total) * 100) : 0,
    };
  },
};
