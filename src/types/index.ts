// ─── Database Types ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  phone: string | null;
  avatar_url: string | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export type MedicationFrequency = 'daily' | 'weekly' | 'custom' | 'as_needed';
export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'drops' | 'other';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  form: MedicationForm;
  frequency: MedicationFrequency;
  instructions: string | null;
  color: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  refill_reminder_days: number | null;
  current_supply: number | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  time_of_day: string; // HH:MM format
  days_of_week: number[] | null; // 0=Sun, 1=Mon, ..., 6=Sat
  notification_id: string | null;
  is_active: boolean;
  created_at: string;
}

export type MedicationLogStatus = 'taken' | 'skipped' | 'missed';

export interface MedicationLog {
  id: string;
  medication_id: string;
  schedule_id: string | null;
  user_id: string;
  scheduled_time: string;
  taken_time: string | null;
  status: MedicationLogStatus;
  notes: string | null;
  created_at: string;
}

export type VitalType = 'blood_pressure' | 'heart_rate' | 'weight' | 'blood_sugar' | 'spo2' | 'temperature';

export interface Vital {
  id: string;
  user_id: string;
  type: VitalType;
  value_primary: number;
  value_secondary: number | null; // e.g., diastolic for blood pressure
  unit: string;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  doctor_name: string | null;
  specialty: string | null;
  location: string | null;
  appointment_date: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  reminder_minutes_before: number;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Condition {
  id: string;
  user_id: string;
  name: string;
  diagnosed_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  is_primary: boolean;
  created_at: string;
}

// ─── App State Types ───────────────────────────────────────────────────────────

export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface MedicationState {
  medications: Medication[];
  schedules: Record<string, MedicationSchedule[]>;
  logs: MedicationLog[];
  isLoading: boolean;
  error: string | null;
}

export interface VitalState {
  vitals: Vital[];
  isLoading: boolean;
  error: string | null;
}

export interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt';

export interface NotificationSettings {
  enabled: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  refillReminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  autoLockMinutes: number;
  hideDataOnBackground: boolean;
}

export interface SettingsState {
  theme: Theme;
  language: Language;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

// ─── Form Types ────────────────────────────────────────────────────────────────

export interface MedicationFormData {
  name: string;
  dosage: string;
  form: MedicationForm;
  frequency: MedicationFrequency;
  instructions: string;
  color: string;
  start_date: string;
  end_date: string;
  times: string[];
  days_of_week: number[];
  current_supply: string;
  refill_reminder_days: string;
}

export interface VitalFormData {
  type: VitalType;
  value_primary: string;
  value_secondary: string;
  notes: string;
  measured_at: string;
}

export interface AppointmentFormData {
  title: string;
  doctor_name: string;
  specialty: string;
  location: string;
  appointment_date: string;
  duration_minutes: string;
  notes: string;
  reminder_minutes_before: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface AdherenceStats {
  total: number;
  taken: number;
  skipped: number;
  missed: number;
  percentage: number;
}

// ─── Supabase Database Types ───────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      medications: {
        Row: Medication;
        Insert: Omit<Medication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Medication, 'id' | 'user_id' | 'created_at'>>;
      };
      medication_schedules: {
        Row: MedicationSchedule;
        Insert: Omit<MedicationSchedule, 'id' | 'created_at'>;
        Update: Partial<Omit<MedicationSchedule, 'id' | 'medication_id' | 'created_at'>>;
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: Omit<MedicationLog, 'id' | 'created_at'>;
        Update: Partial<Omit<MedicationLog, 'id' | 'created_at'>>;
      };
      vitals: {
        Row: Vital;
        Insert: Omit<Vital, 'id' | 'created_at'>;
        Update: Partial<Omit<Vital, 'id' | 'user_id' | 'created_at'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'user_id' | 'created_at'>>;
      };
      conditions: {
        Row: Condition;
        Insert: Omit<Condition, 'id' | 'created_at'>;
        Update: Partial<Omit<Condition, 'id' | 'user_id' | 'created_at'>>;
      };
      emergency_contacts: {
        Row: EmergencyContact;
        Insert: Omit<EmergencyContact, 'id' | 'created_at'>;
        Update: Partial<Omit<EmergencyContact, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
