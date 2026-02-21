-- ══════════════════════════════════════════════════════════════════
-- Migration 0003: Driver Mobile Setup
-- Ensures all invariants for the driver-only mobile app are met.
-- Safe to re-run (all statements are idempotent).
-- ══════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────
-- 1) Ensure "Driver" role exists
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.roles (name)
VALUES ('Driver')
ON CONFLICT (name) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────
-- 2) Backfill: set role_id for users whose auth metadata says Driver
--    but whose profile still points to a different role (or NULL).
-- ─────────────────────────────────────────────────────────────────
UPDATE public.profiles p
SET role_id = r.id
FROM public.roles r, auth.users u
WHERE p.id = u.id
  AND r.name = 'Driver'
  AND coalesce(u.raw_user_meta_data->>'role', '') ILIKE 'driver'
  AND p.role_id IS DISTINCT FROM r.id;


-- ─────────────────────────────────────────────────────────────────
-- 3) Backfill: create missing drivers rows for Driver-role profiles.
--    Uses TEMP- license numbers — replace manually for real drivers.
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.drivers (
  id, name, license_no, license_expiry, license_category,
  status, safety_score
)
SELECT
  p.id,
  coalesce(nullif(p.full_name, ''), 'Driver'),
  upper('TEMP-' || substr(replace(p.id::text, '-', ''), 1, 12)),
  current_date + interval '365 days',
  'LMV',
  'On Duty',
  100
FROM public.profiles p
JOIN public.roles r ON r.id = p.role_id AND r.name = 'Driver'
LEFT JOIN public.drivers d ON d.id = p.id
WHERE d.id IS NULL;


-- ─────────────────────────────────────────────────────────────────
-- 4) Ensure handle_new_user trigger is latest version
--    (idempotent — CREATE OR REPLACE)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  incoming_role          text;
  v_role_id              uuid;
  v_role_name            text;
  v_full_name            text;
  v_license_no           text;
  v_license_expiry_text  text;
  v_license_category     text;
BEGIN
  incoming_role := coalesce(new.raw_user_meta_data->>'role', 'Dispatcher');
  v_full_name  := trim(coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- Look up the role in the roles table (case-insensitive match)
  SELECT id, name INTO v_role_id, v_role_name
  FROM roles WHERE lower(name) = lower(incoming_role) LIMIT 1;

  -- Fallback to Dispatcher if role not found
  IF v_role_id IS NULL THEN
    SELECT id, name INTO v_role_id, v_role_name
    FROM roles WHERE name = 'Dispatcher' LIMIT 1;
  END IF;

  -- 1. Always create a profile row
  INSERT INTO profiles (id, full_name, email, role_id)
  VALUES (
    new.id,
    v_full_name,
    coalesce(new.email, ''),
    v_role_id
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = excluded.full_name,
      email     = excluded.email,
      role_id   = excluded.role_id;

  -- 2. If role is Driver, also create a drivers row (drivers.id = auth.uid)
  IF v_role_name = 'Driver' THEN
    v_license_no          := upper(trim(coalesce(new.raw_user_meta_data->>'license_no', '')));
    v_license_expiry_text := trim(coalesce(new.raw_user_meta_data->>'license_expiry', ''));
    v_license_category    := trim(coalesce(new.raw_user_meta_data->>'license_category', 'LMV'));

    -- Only auto-create if license info was provided
    IF v_license_no <> '' AND v_license_expiry_text <> '' THEN
      INSERT INTO drivers (id, name, license_no, license_expiry, license_category, status, safety_score)
      VALUES (
        new.id,
        coalesce(nullif(v_full_name, ''), 'Driver'),
        v_license_no,
        v_license_expiry_text::date,
        CASE WHEN v_license_category IN ('A','B','C','D','E','LMV','HMV','HGMV','MCWG')
             THEN v_license_category ELSE 'LMV' END,
        'Off Duty',
        100
      )
      ON CONFLICT (id) DO UPDATE
      SET name             = excluded.name,
          license_no       = excluded.license_no,
          license_expiry   = excluded.license_expiry,
          license_category = excluded.license_category;
    END IF;
  END IF;

  RETURN new;
END;
$$;


-- ─────────────────────────────────────────────────────────────────
-- 5) RLS policy: let Driver role read own notifications (re-assert)
--    Drops and recreates only if missing — safe to run again.
-- ─────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Notification SELECT policy (drivers own + staff all)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'driver_notifications' AND policyname = 'notifications_select'
  ) THEN
    CREATE POLICY "notifications_select" ON driver_notifications
    FOR SELECT TO authenticated
    USING (driver_id = auth.uid() OR public.role_name() IN ('Manager','Dispatcher','Safety Officer'));
  END IF;

  -- Notification UPDATE policy (driver marks own read, staff can edit)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'driver_notifications' AND policyname = 'notifications_update'
  ) THEN
    CREATE POLICY "notifications_update" ON driver_notifications
    FOR UPDATE TO authenticated
    USING  (driver_id = auth.uid() OR public.role_name() IN ('Manager','Dispatcher'))
    WITH CHECK (driver_id = auth.uid() OR public.role_name() IN ('Manager','Dispatcher'));
  END IF;

  -- Trips SELECT policy (all authenticated; driver gets own via this)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trips' AND policyname = 'trips_select'
  ) THEN
    CREATE POLICY "trips_select" ON trips
    FOR SELECT TO authenticated USING (true);
  END IF;

  -- Drivers self-update for mobile profile edits
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'drivers' AND policyname = 'drivers_update_self'
  ) THEN
    CREATE POLICY "drivers_update_self" ON drivers
    FOR UPDATE TO authenticated
    USING  (public.role_name() = 'Driver' AND id = auth.uid())
    WITH CHECK (public.role_name() = 'Driver' AND id = auth.uid());
  END IF;

  -- Profiles self-update for mobile profile edits
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 6) Realtime: ensure driver tables are published
-- ─────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public' AND tablename = 'driver_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public' AND tablename = 'trips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
  END IF;
END $$;
