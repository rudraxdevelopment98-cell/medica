# MediCare — Multi-Role Platform Architecture

> **Status:** Design proposal (Phase 2). Not yet implemented.
> **Scope:** Extends the shipped patient-only app into a patient + doctor + caregiver + admin platform.
> **Audience:** Reviewer (product owner) — read this and approve the data model *before* code changes begin.

---

## 1. Disclaimer & regulatory posture (read first)

The shipped app is positioned as a **"reminder tool, not a medical device."** The moment a
**doctor reads another person's health data or prescribes through the app**, that positioning
changes and the regulatory bar rises sharply:

- **HIPAA (US)** — requires audit logging, access controls, breach notification, and a signed
  **BAA (Business Associate Agreement) with Supabase**. Supabase offers HIPAA-eligible projects
  on paid plans only.
- **GDPR (EU)** — lawful basis + explicit consent, right to erasure, data-processing records.
- **India DPDP Act 2023** — consent, purpose limitation, data-fiduciary obligations.

**Decision required from you:** Do we (a) stay a *patient-controlled record* where the patient
explicitly shares with a provider (lower bar, "personal health record"), or (b) become a
*provider-facing clinical tool* (full medical-device / HIPAA scope)? This doc assumes **(a)** —
patient-owned data, provider access only via explicit patient consent. That keeps us defensible
while still enabling the doctor experience.

---

## 2. Roles

| Role | Description | Owns data? | Sees others' data? |
|------|-------------|-----------|--------------------|
| **patient** | Self-manages meds, vitals, appointments, conditions | Yes (their own) | No |
| **doctor** | Views consented patients, prescribes, manages provider-side appointments | No | Only approved patients |
| **caregiver** | Family member managing a dependent's care | No | Only approved dependents |
| **admin** | Platform/clinic operator: user & access management, audit | No (operational) | Via audited admin policy only |

A single auth user has exactly **one role** at the platform level (stored on `profiles.role`).
Edge cases (a doctor who is also a patient) are handled by the doctor creating a separate
patient account, or — later — a `role[]` array. Start with a single role for simplicity.

---

## 3. Core principle: patient owns the data, access is granted

Today every RLS policy is `auth.uid() = user_id`. The platform replaces that with:

> **"You may access a row if you OWN it, OR you are an APPROVED care-team member of its owner."**

This is enforced by a single SQL helper function `has_care_access(owner_id)` used across all
policies, so the access rule lives in one place.

---

## 4. New tables

### 4.1 `profiles.role` (extend existing table)

```sql
ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'patient'
    CHECK (role IN ('patient','doctor','caregiver','admin'));
```

### 4.2 `doctor_profiles` (role-specific data)

```sql
CREATE TABLE public.doctor_profiles (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number  TEXT NOT NULL,
  specialty       TEXT,
  clinic_name     TEXT,
  clinic_address  TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,  -- admin-verified license
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.3 `care_relationships` (the heart of the platform)

Links a **member** (doctor or caregiver) to a **patient**, gated by consent status.

```sql
CREATE TABLE public.care_relationships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role   TEXT NOT NULL CHECK (member_role IN ('doctor','caregiver')),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','revoked','rejected')),
  -- granular permissions, so a patient can share vitals but not, say, conditions
  can_view_medications  BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_vitals       BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_appointments BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_conditions   BOOLEAN NOT NULL DEFAULT FALSE,
  can_prescribe         BOOLEAN NOT NULL DEFAULT FALSE,  -- doctors only
  requested_by  UUID NOT NULL REFERENCES public.profiles(id),
  approved_at   TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, member_id)
);

CREATE INDEX idx_care_rel_patient ON public.care_relationships(patient_id, status);
CREATE INDEX idx_care_rel_member  ON public.care_relationships(member_id, status);
```

### 4.4 `audit_logs` (compliance requirement)

Every cross-user data access by a doctor/caregiver/admin is recorded.

```sql
CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID NOT NULL REFERENCES public.profiles(id),
  patient_id  UUID NOT NULL REFERENCES public.profiles(id),
  action      TEXT NOT NULL,        -- 'view_vitals','create_medication', etc.
  resource    TEXT NOT NULL,        -- table name
  resource_id UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_patient ON public.audit_logs(patient_id, created_at DESC);
CREATE INDEX idx_audit_actor   ON public.audit_logs(actor_id, created_at DESC);
```

> Audit writes are best done via `SECURITY DEFINER` RPC functions or Edge Functions so the
> client cannot forge or skip them.

---

## 5. The access helper + RLS rewrite

A single function expresses "owner OR approved care-team member":

```sql
CREATE OR REPLACE FUNCTION public.has_care_access(
  owner_id UUID,
  resource TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
  SELECT
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.care_relationships cr
      WHERE cr.patient_id = owner_id
        AND cr.member_id  = auth.uid()
        AND cr.status     = 'approved'
        AND (
          resource IS NULL
          OR (resource = 'medications'  AND cr.can_view_medications)
          OR (resource = 'vitals'       AND cr.can_view_vitals)
          OR (resource = 'appointments' AND cr.can_view_appointments)
          OR (resource = 'conditions'   AND cr.can_view_conditions)
        )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

Then each existing table's policy splits into a **read** policy (uses `has_care_access`) and a
**write** policy. Writes generally stay owner-only, except doctors with `can_prescribe`:

```sql
-- READ: owner or approved member with permission for this resource
CREATE POLICY "read vitals" ON public.vitals FOR SELECT
  USING (public.has_care_access(user_id, 'vitals'));

-- WRITE: owner only (vitals are patient-entered)
CREATE POLICY "write own vitals" ON public.vitals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (UPDATE/DELETE owner-only too)
```

For **medications**, a doctor with `can_prescribe = true` may INSERT on the patient's behalf:

```sql
CREATE POLICY "insert medications (owner or prescriber)"
  ON public.medications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.care_relationships cr
      WHERE cr.patient_id = user_id AND cr.member_id = auth.uid()
        AND cr.status = 'approved' AND cr.can_prescribe
    )
  );
```

**Migration note:** the existing `FOR ALL` policies are dropped and replaced with explicit
`SELECT` / `INSERT` / `UPDATE` / `DELETE` policies. This is the security-critical change — it
needs careful testing (see §8).

---

## 6. Consent flow (UX)

1. **Doctor requests** a patient (by email/code) OR **patient invites** a doctor.
2. Row created in `care_relationships` with `status = 'pending'`, `requested_by` set.
3. The **patient must approve** — even if the doctor initiated — and chooses granular permissions.
4. On approval → `status = 'approved'`, `approved_at = now()`. Access begins.
5. **Patient can revoke anytime** → `status = 'revoked'`, access ends immediately (RLS re-checks live).

Key rule: **a doctor can never self-approve access.** Approval is always a patient action.

---

## 7. App / code changes

```
app/
├── (patient)/          # existing tabs, unchanged
├── (doctor)/           # NEW: roster, patient detail, prescribe, schedule
│   ├── _layout.tsx
│   ├── index.tsx       # patient roster
│   ├── patient/[id].tsx
│   └── requests.tsx    # outgoing access requests
├── (caregiver)/        # NEW: dependents list + dependent detail
└── _layout.tsx         # role-based redirect: route to the right stack by profiles.role

src/
├── stores/
│   ├── careRelationshipStore.ts   # NEW
│   └── roleStore.ts               # NEW (current role, role guards)
├── services/
│   ├── careRelationshipService.ts # NEW: request/approve/revoke/list
│   └── auditService.ts            # NEW (or via RPC)
└── types/index.ts                 # + Role, CareRelationship, DoctorProfile, AuditLog
```

Root layout reads `profiles.role` after auth and redirects into `(patient)`, `(doctor)`, or
`(caregiver)`. Admin is a separate web console (out of scope for the mobile app initially).

---

## 8. Testing the RLS (non-negotiable)

Before shipping, write SQL/integration tests proving:

- Patient A **cannot** read Patient B's anything.
- Doctor **cannot** read a patient with `status != 'approved'`.
- Doctor **can** read exactly the resources their relationship permits, nothing more.
- Revoking a relationship **immediately** cuts access.
- Doctor without `can_prescribe` **cannot** insert medications for a patient.
- Every doctor read of patient data produces an `audit_logs` row.

---

## 9. Phased rollout

| Phase | Deliverable |
|-------|-------------|
| **2a** | Schema: `role`, `doctor_profiles`, `care_relationships`, `audit_logs` + `has_care_access` + RLS rewrite + RLS tests |
| **2b** | Consent flow (request/approve/revoke) + role-based routing |
| **2c** | Doctor experience: roster, patient detail (read-only), prescribe |
| **2d** | Caregiver experience |
| **2e** | Admin console (web) + license verification |
| **3** | Compliance hardening: BAA, audit retention, telehealth/messaging (if pursued) |

---

## 10. Open decisions for the reviewer

1. **Regulatory posture** — patient-controlled PHR (assumed) vs. full clinical tool? (§1)
2. **Single role vs. multi-role per user** — start single? (§2)
3. **Granular vs. all-or-nothing sharing** — this doc proposes granular per-resource consent. Keep it, or simplify to one toggle?
4. **Who can initiate a relationship** — doctor-initiated + patient-approve, patient-initiated, or both? (§6)
5. **Admin surface** — web-only console, or in-app?

Answer these and Phase 2a (schema + RLS) can begin.
