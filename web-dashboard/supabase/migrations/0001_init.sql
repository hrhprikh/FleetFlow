-- ══════════════════════════════════════════════════════════════════
-- FleetFlow – Combined Production Schema
-- Migration 0001: Initial Schema
-- Combines v1 ENUMs, roles table, tables, RPCs, triggers, indexes
-- with v02 audit_logs, driver_notifications, fine-grained RLS
-- ══════════════════════════════════════════════════════════════════

-- ── EXTENSIONS ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('Available', 'On Trip', 'In Shop', 'Out of Service');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE driver_status AS ENUM ('On Duty', 'Off Duty', 'Suspended');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_status AS ENUM ('Open', 'Closed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_type AS ENUM ('fuel', 'toll', 'repair', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;


-- ── TABLES ─────────────────────────────────────────────────────

-- 1. Roles (v1 pattern – separate table, extensible)
CREATE TABLE IF NOT EXISTS roles (
  id   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL
);

-- 2. Profiles (extends auth.users, FK to roles)
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name  text,
  email      text,
  role_id    uuid REFERENCES roles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plate            text UNIQUE NOT NULL,
  model            text NOT NULL,
  type             text NOT NULL,
  max_capacity     integer NOT NULL DEFAULT 0,
  odometer         integer NOT NULL DEFAULT 0,
  status           vehicle_status DEFAULT 'Available',
  acquisition_cost numeric(12,2) DEFAULT 0,
  is_archived      boolean NOT NULL DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

-- 4. Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text NOT NULL,
  license_no       text UNIQUE NOT NULL,
  license_expiry   date NOT NULL,
  license_category text NOT NULL,
  status           driver_status DEFAULT 'On Duty',
  safety_score     integer DEFAULT 100,
  trip_count       integer DEFAULT 0,
  completed_trips  integer DEFAULT 0,
  accidents        integer DEFAULT 0,
  late_deliveries  integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

-- 5. Trips
CREATE TABLE IF NOT EXISTS trips (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id   uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  driver_id    uuid REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  origin       text NOT NULL,
  destination  text NOT NULL,
  cargo_weight integer NOT NULL DEFAULT 0,
  status       trip_status DEFAULT 'Draft',
  scheduled_date date,
  scheduled_time time,
  start_time   timestamptz,
  end_time     timestamptz,
  start_odo    integer,
  end_odo      integer,
  revenue      numeric(12,2) DEFAULT 0,
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

-- 6. Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id   uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  description  text,
  cost         numeric(12,2) DEFAULT 0,
  status       maintenance_status DEFAULT 'Open',
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now(),
  closed_at    timestamptz
);

-- 7. Fuel Logs (enhanced with expense_type from v02)
CREATE TABLE IF NOT EXISTS fuel_logs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id   uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  trip_id      uuid REFERENCES trips(id) ON DELETE SET NULL,
  expense_type expense_type DEFAULT 'fuel',
  liters       numeric(10,2),
  cost         numeric(12,2) NOT NULL,
  notes        text,
  date         timestamptz DEFAULT now(),
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- 8. Audit Logs (from v02)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  entity_name text NOT NULL,
  entity_id   uuid,
  action      text NOT NULL,
  before_data jsonb,
  after_data  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 9. Driver Notifications (from v02)
CREATE TABLE IF NOT EXISTS driver_notifications (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id  uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  trip_id    uuid REFERENCES trips(id) ON DELETE SET NULL,
  title      text NOT NULL,
  message    text NOT NULL,
  payload    jsonb,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz
);


-- ── INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vehicles_plate            ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status           ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status            ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry    ON drivers(license_expiry);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id          ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id           ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status              ON trips(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id    ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status        ON maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_id           ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity              ON audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_driver      ON driver_notifications(driver_id, created_at DESC);


-- ── ROW-LEVEL SECURITY ─────────────────────────────────────────
ALTER TABLE roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips                ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_notifications ENABLE ROW LEVEL SECURITY;


-- ── HELPER: current_role_name() ────────────────────────────────
CREATE OR REPLACE FUNCTION public.role_name()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT r.name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;


-- ── RLS POLICIES ───────────────────────────────────────────────
-- Fine-grained per-operation policies (v02 pattern)

-- ROLES: read-only for all authenticated
CREATE POLICY "roles_select" ON roles FOR SELECT TO authenticated USING (true);

-- PROFILES: own row read, self update; managers can read all
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.role_name() = 'Manager');
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- VEHICLES
CREATE POLICY "vehicles_select" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicles_insert" ON vehicles FOR INSERT TO authenticated
  WITH CHECK (public.role_name() = 'Manager');
CREATE POLICY "vehicles_update" ON vehicles FOR UPDATE TO authenticated
  USING  (public.role_name() IN ('Manager', 'Dispatcher'))
  WITH CHECK (public.role_name() IN ('Manager', 'Dispatcher'));
CREATE POLICY "vehicles_delete" ON vehicles FOR DELETE TO authenticated
  USING (public.role_name() = 'Manager');

-- DRIVERS
CREATE POLICY "drivers_select" ON drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "drivers_insert" ON drivers FOR INSERT TO authenticated
  WITH CHECK (public.role_name() IN ('Manager', 'Safety Officer'));
-- Allow Driver role to self-insert (used by handle_new_user trigger)
CREATE POLICY "drivers_insert_self" ON drivers FOR INSERT TO authenticated
  WITH CHECK (public.role_name() = 'Driver' AND id = auth.uid());
CREATE POLICY "drivers_update" ON drivers FOR UPDATE TO authenticated
  USING  (public.role_name() IN ('Manager', 'Safety Officer', 'Dispatcher'))
  WITH CHECK (public.role_name() IN ('Manager', 'Safety Officer', 'Dispatcher'));
-- Allow Driver role to update own row (e.g. status toggle)
CREATE POLICY "drivers_update_self" ON drivers FOR UPDATE TO authenticated
  USING  (public.role_name() = 'Driver' AND id = auth.uid())
  WITH CHECK (public.role_name() = 'Driver' AND id = auth.uid());
CREATE POLICY "drivers_delete" ON drivers FOR DELETE TO authenticated
  USING (public.role_name() = 'Manager');

-- TRIPS (all authenticated can read; Driver can also read own assigned trips)
CREATE POLICY "trips_select" ON trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "trips_insert" ON trips FOR INSERT TO authenticated
  WITH CHECK (public.role_name() IN ('Manager', 'Dispatcher'));
CREATE POLICY "trips_update" ON trips FOR UPDATE TO authenticated
  USING  (public.role_name() IN ('Manager', 'Dispatcher'))
  WITH CHECK (public.role_name() IN ('Manager', 'Dispatcher'));
CREATE POLICY "trips_delete" ON trips FOR DELETE TO authenticated
  USING (public.role_name() = 'Manager');

-- MAINTENANCE LOGS
CREATE POLICY "maintenance_select" ON maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_insert" ON maintenance_logs FOR INSERT TO authenticated
  WITH CHECK (public.role_name() IN ('Manager', 'Safety Officer'));
CREATE POLICY "maintenance_update" ON maintenance_logs FOR UPDATE TO authenticated
  USING  (public.role_name() IN ('Manager', 'Safety Officer'))
  WITH CHECK (public.role_name() IN ('Manager', 'Safety Officer'));
CREATE POLICY "maintenance_delete" ON maintenance_logs FOR DELETE TO authenticated
  USING (public.role_name() = 'Manager');

-- FUEL LOGS
CREATE POLICY "fuel_select" ON fuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "fuel_insert" ON fuel_logs FOR INSERT TO authenticated
  WITH CHECK (public.role_name() IN ('Manager', 'Financial Analyst', 'Dispatcher'));
CREATE POLICY "fuel_update" ON fuel_logs FOR UPDATE TO authenticated
  USING  (public.role_name() IN ('Manager', 'Financial Analyst'))
  WITH CHECK (public.role_name() IN ('Manager', 'Financial Analyst'));
CREATE POLICY "fuel_delete" ON fuel_logs FOR DELETE TO authenticated
  USING (public.role_name() = 'Manager');

-- AUDIT LOGS: managers read-only, any authenticated can insert
CREATE POLICY "audit_select" ON audit_logs FOR SELECT TO authenticated
  USING (public.role_name() = 'Manager');
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- DRIVER NOTIFICATIONS (Driver sees own; staff sees all)
CREATE POLICY "notifications_select" ON driver_notifications FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR public.role_name() IN ('Manager', 'Dispatcher', 'Safety Officer'));
CREATE POLICY "notifications_insert" ON driver_notifications FOR INSERT TO authenticated
  WITH CHECK (public.role_name() IN ('Manager', 'Dispatcher'));
CREATE POLICY "notifications_update" ON driver_notifications FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() OR public.role_name() IN ('Manager', 'Dispatcher'))
  WITH CHECK (driver_id = auth.uid() OR public.role_name() IN ('Manager', 'Dispatcher'));


-- ── DATABASE FUNCTIONS (RPCs) – Atomic Trip Lifecycle ──────────

-- 1. Dispatch Trip
CREATE OR REPLACE FUNCTION dispatch_trip(target_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id uuid;
  v_driver_id  uuid;
BEGIN
  SELECT vehicle_id, driver_id INTO v_vehicle_id, v_driver_id
  FROM trips WHERE id = target_trip_id AND status = 'Draft' FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found or not in Draft status.';
  END IF;

  UPDATE vehicles SET status = 'On Trip'
  WHERE id = v_vehicle_id AND status = 'Available';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle is not currently Available.';
  END IF;

  UPDATE drivers SET status = 'On Duty'
  WHERE id = v_driver_id;

  UPDATE trips SET status = 'Dispatched', start_time = now()
  WHERE id = target_trip_id;
END;
$$;

-- 2. Complete Trip
CREATE OR REPLACE FUNCTION complete_trip(target_trip_id uuid, final_odo integer, trip_revenue numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id uuid;
  v_driver_id  uuid;
  v_start_odo  integer;
BEGIN
  SELECT vehicle_id, driver_id INTO v_vehicle_id, v_driver_id
  FROM trips WHERE id = target_trip_id AND status = 'Dispatched' FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found or not in Dispatched status.';
  END IF;

  SELECT odometer INTO v_start_odo FROM vehicles WHERE id = v_vehicle_id;

  UPDATE vehicles SET status = 'Available', odometer = GREATEST(odometer, final_odo)
  WHERE id = v_vehicle_id;

  UPDATE drivers SET trip_count = trip_count + 1, completed_trips = completed_trips + 1
  WHERE id = v_driver_id;

  UPDATE trips SET status = 'Completed', end_time = now(),
    start_odo = v_start_odo, end_odo = final_odo, revenue = trip_revenue
  WHERE id = target_trip_id;
END;
$$;

-- 3. Cancel Trip
CREATE OR REPLACE FUNCTION cancel_trip(target_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id   uuid;
  v_driver_id    uuid;
  current_status trip_status;
BEGIN
  SELECT vehicle_id, driver_id, status INTO v_vehicle_id, v_driver_id, current_status
  FROM trips WHERE id = target_trip_id FOR UPDATE;

  IF current_status = 'Completed' OR current_status = 'Cancelled' THEN
    RAISE EXCEPTION 'Trip is already completed or cancelled.';
  END IF;

  IF current_status = 'Dispatched' THEN
    UPDATE vehicles SET status = 'Available' WHERE id = v_vehicle_id AND status = 'On Trip';
    UPDATE drivers SET status = 'Off Duty' WHERE id = v_driver_id;
  END IF;

  UPDATE trips SET status = 'Cancelled', end_time = now() WHERE id = target_trip_id;
END;
$$;


-- ── TRIGGERS – Auto Vehicle ↔ Maintenance Status ──────────────

-- On maintenance INSERT → vehicle goes to In Shop
CREATE OR REPLACE FUNCTION auto_set_vehicle_in_shop()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'Open' THEN
    UPDATE vehicles SET status = 'In Shop' WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintenance_insert ON maintenance_logs;
CREATE TRIGGER trg_maintenance_insert
  AFTER INSERT ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION auto_set_vehicle_in_shop();

-- On maintenance close → release vehicle if no other open logs
CREATE OR REPLACE FUNCTION auto_release_vehicle_from_shop()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  open_logs integer;
  v_status  vehicle_status;
BEGIN
  IF OLD.status = 'Open' AND NEW.status = 'Closed' THEN
    SELECT COUNT(*) INTO open_logs FROM maintenance_logs
    WHERE vehicle_id = NEW.vehicle_id AND status = 'Open' AND id != NEW.id;

    IF open_logs = 0 THEN
      SELECT status INTO v_status FROM vehicles WHERE id = NEW.vehicle_id;
      IF v_status = 'In Shop' THEN
        UPDATE vehicles SET status = 'Available' WHERE id = NEW.vehicle_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintenance_update ON maintenance_logs;
CREATE TRIGGER trg_maintenance_update
  AFTER UPDATE OF status ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION auto_release_vehicle_from_shop();


-- ── AUTH TRIGGER – Auto-create profile (+ driver row) on signup ─

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
    v_license_no       := upper(trim(coalesce(new.raw_user_meta_data->>'license_no', '')));
    v_license_expiry_text := trim(coalesce(new.raw_user_meta_data->>'license_expiry', ''));
    v_license_category := trim(coalesce(new.raw_user_meta_data->>'license_category', 'LMV'));

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── GRANTS – Ensure authenticated role has table access ────────
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;


-- ── REALTIME – Publish tables for live updates ────────────────
DO $$
BEGIN
  -- driver_notifications: push notifications to mobile
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'driver_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_notifications;
  END IF;

  -- trips: live trip status updates for driver app
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'trips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
  END IF;
END $$;


-- ── SEED: Default roles ────────────────────────────────────────
INSERT INTO roles (name) VALUES
  ('Manager'),
  ('Dispatcher'),
  ('Safety Officer'),
  ('Financial Analyst'),
  ('Driver')
ON CONFLICT (name) DO NOTHING;
