# MediCare

A privacy-first medical reminder app built with React Native, Expo SDK 52, TypeScript, Zustand, and Supabase.

## Features

- **Auth** — Supabase email/password authentication with protected routes
- **Dashboard** — Adherence tracking, today's medications, upcoming appointments
- **Medications** — Full CRUD with daily/weekly/custom schedules and local push reminders
- **Vitals** — Log blood pressure, heart rate, weight, blood sugar, SpO2, temperature
- **Appointments** — CRUD with date/time/doctor/location and push reminders
- **Profile** — Personal info including blood type, date of birth
- **Settings** — Theme (light/dark/system), notification preferences
- **Security** — Biometric lock (Face ID/fingerprint), PIN, privacy settings

## Stack

- React Native + Expo SDK 52
- TypeScript (strict mode)
- Expo Router v4 (file-based routing)
- Zustand (state management)
- Supabase (auth + PostgreSQL with Row-Level Security)
- expo-notifications (local reminders)
- expo-local-authentication (biometrics)

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Apply the Supabase schema from `supabase/schema.sql` to your Supabase project.

4. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
medica/
├── app/                  # Expo Router screens
│   ├── (auth)/           # Login, register
│   ├── (tabs)/           # Dashboard, medications, vitals, appointments
│   ├── medications/      # Detail & new medication screens
│   ├── vitals/           # Detail & new vital screens
│   ├── appointments/     # Detail & new appointment screens
│   ├── profile.tsx
│   ├── settings.tsx
│   └── security.tsx
└── src/
    ├── components/       # Reusable UI kit
    ├── stores/           # Zustand stores
    ├── services/         # Supabase service layer
    ├── hooks/            # Custom hooks
    ├── types/            # TypeScript types
    └── constants/        # Theme, config
```

## Database

Run `supabase/schema.sql` against your Supabase project. It includes:

- `profiles` — extends `auth.users`
- `medications` — medication records
- `medication_schedules` — reminder schedules
- `medication_logs` — adherence tracking
- `vitals` — health metric readings
- `appointments` — scheduled appointments
- `conditions` — medical conditions
- `emergency_contacts` — emergency contacts
- Row-Level Security (RLS) on every table
- Performance indexes

---

> **Disclaimer:** MediCare is a reminder tool, not a medical device. It is not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional for medical advice.
