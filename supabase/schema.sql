-- ─────────────────────────────────────────────────────────────────
-- MediCare Database Schema with Row-Level Security
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone           TEXT,
  avatar_url      TEXT,
  blood_type      TEXT,
  height_cm       NUMERIC(5, 1),
  weight_kg       NUMERIC(5, 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── medications ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medications (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  dosage               TEXT NOT NULL,
  form                 TEXT NOT NULL CHECK (form IN ('tablet','capsule','liquid','injection','topical','inhaler','drops','other')),
  frequency            TEXT NOT NULL CHECK (frequency IN ('daily','weekly','custom','as_needed')),
  instructions         TEXT,
  color                TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  start_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date             DATE,
  refill_reminder_days INTEGER,
  current_supply       NUMERIC(6, 1),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_is_active ON public.medications(user_id, is_active);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medications"
  ON public.medications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── medication_schedules ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medication_schedules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id   UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  time_of_day     TEXT NOT NULL, -- HH:MM format
  days_of_week    INTEGER[], -- 0=Sun .. 6=Sat; NULL means every day
  notification_id TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_medication_id ON public.medication_schedules(medication_id);

ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own schedules"
  ON public.medication_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.medications m
      WHERE m.id = medication_id AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.medications m
      WHERE m.id = medication_id AND m.user_id = auth.uid()
    )
  );

-- ─── medication_logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id  UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  schedule_id    UUID REFERENCES public.medication_schedules(id) ON DELETE SET NULL,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_time     TIMESTAMPTZ,
  status         TEXT NOT NULL CHECK (status IN ('taken','skipped','missed')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id       ON public.medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_scheduled_time ON public.medication_logs(user_id, scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_logs_medication_id  ON public.medication_logs(medication_id);

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medication logs"
  ON public.medication_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── vitals ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vitals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('blood_pressure','heart_rate','weight','blood_sugar','spo2','temperature')),
  value_primary   NUMERIC(8, 2) NOT NULL,
  value_secondary NUMERIC(8, 2), -- diastolic for blood pressure
  unit            TEXT NOT NULL,
  notes           TEXT,
  measured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_user_id    ON public.vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_type       ON public.vitals(user_id, type);
CREATE INDEX IF NOT EXISTS idx_vitals_measured   ON public.vitals(user_id, measured_at DESC);

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vitals"
  ON public.vitals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── appointments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                    TEXT NOT NULL,
  doctor_name              TEXT,
  specialty                TEXT,
  location                 TEXT,
  appointment_date         TIMESTAMPTZ NOT NULL,
  duration_minutes         INTEGER NOT NULL DEFAULT 30,
  status                   TEXT NOT NULL DEFAULT 'scheduled'
                             CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
  notes                    TEXT,
  reminder_minutes_before  INTEGER NOT NULL DEFAULT 30,
  notification_id          TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON public.appointments(user_id, appointment_date ASC);
CREATE INDEX IF NOT EXISTS idx_appointments_status  ON public.appointments(user_id, status);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own appointments"
  ON public.appointments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── conditions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conditions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  diagnosed_date DATE,
  notes          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conditions_user_id ON public.conditions(user_id);

ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conditions"
  ON public.conditions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── emergency_contacts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emergency contacts"
  ON public.emergency_contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── updated_at trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles', 'medications', 'appointments'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;
