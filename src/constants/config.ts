export const Config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  appName: 'MediCare',
  appVersion: '1.0.0',
  supportEmail: 'support@medicare-app.example.com',
  privacyPolicyUrl: 'https://medicare-app.example.com/privacy',
  termsUrl: 'https://medicare-app.example.com/terms',
};

export const VitalUnits: Record<string, { unit: string; label: string; min: number; max: number; secondaryLabel?: string }> = {
  blood_pressure: { unit: 'mmHg', label: 'Blood Pressure', min: 50, max: 250, secondaryLabel: 'Diastolic' },
  heart_rate: { unit: 'bpm', label: 'Heart Rate', min: 30, max: 250 },
  weight: { unit: 'kg', label: 'Weight', min: 1, max: 500 },
  blood_sugar: { unit: 'mg/dL', label: 'Blood Sugar', min: 20, max: 600 },
  spo2: { unit: '%', label: 'Oxygen Saturation', min: 70, max: 100 },
  temperature: { unit: '°C', label: 'Temperature', min: 30, max: 45 },
};

export const MedicationColors = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F59E0B', // amber
  '#6366F1', // indigo
];

export const DEFAULT_REMINDER_MINUTES = 30;
export const DEFAULT_REFILL_REMINDER_DAYS = 7;
