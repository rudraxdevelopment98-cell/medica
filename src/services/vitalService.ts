import { supabase } from './supabase';
import type { Vital, VitalType } from '../types';

export const vitalService = {
  async getVitals(userId: string, type?: VitalType): Promise<Vital[]> {
    let query = supabase
      .from('vitals')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false });
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async createVital(vital: Omit<Vital, 'id' | 'created_at'>): Promise<Vital> {
    const { data, error } = await supabase
      .from('vitals')
      .insert(vital)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteVital(id: string): Promise<void> {
    const { error } = await supabase.from('vitals').delete().eq('id', id);
    if (error) throw error;
  },

  async getLatestByType(userId: string): Promise<Record<VitalType, Vital | null>> {
    const types: VitalType[] = ['blood_pressure', 'heart_rate', 'weight', 'blood_sugar', 'spo2', 'temperature'];
    const result: Partial<Record<VitalType, Vital | null>> = {};
    await Promise.all(
      types.map(async (type) => {
        const { data } = await supabase
          .from('vitals')
          .select('*')
          .eq('user_id', userId)
          .eq('type', type)
          .order('measured_at', { ascending: false })
          .limit(1)
          .single();
        result[type] = data ?? null;
      })
    );
    return result as Record<VitalType, Vital | null>;
  },
};
