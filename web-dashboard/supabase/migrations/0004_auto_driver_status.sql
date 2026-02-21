-- ══════════════════════════════════════════════════════════════
-- Migration: Auto-manage driver On Duty / Off Duty status
--
-- Logic:
--   • dispatch_trip  → driver becomes "On Duty"       (already existed)
--   • complete_trip  → driver becomes "Off Duty"       (NEW)
--   • cancel_trip    → driver becomes "Off Duty"       (already existed for Dispatched)
--
-- "On Duty" = driver is on an active trip
-- "Off Duty" = driver has no active trips
-- ══════════════════════════════════════════════════════════════

-- 1. Rebuild complete_trip to set driver Off Duty when trip finishes
CREATE OR REPLACE FUNCTION complete_trip(target_trip_id uuid, final_odo integer, trip_revenue numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id uuid;
  v_driver_id  uuid;
  v_start_odo  integer;
  v_active_count integer;
BEGIN
  SELECT vehicle_id, driver_id INTO v_vehicle_id, v_driver_id
  FROM trips WHERE id = target_trip_id AND status = 'Dispatched' FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found or not in Dispatched status.';
  END IF;

  SELECT odometer INTO v_start_odo FROM vehicles WHERE id = v_vehicle_id;

  -- Return vehicle to Available
  UPDATE vehicles SET status = 'Available', odometer = GREATEST(odometer, final_odo)
  WHERE id = v_vehicle_id;

  -- Increment driver stats
  UPDATE drivers SET trip_count = trip_count + 1, completed_trips = completed_trips + 1
  WHERE id = v_driver_id;

  -- Mark trip completed
  UPDATE trips SET status = 'Completed', end_time = now(),
    start_odo = v_start_odo, end_odo = final_odo, revenue = trip_revenue
  WHERE id = target_trip_id;

  -- Check if driver has any OTHER active trips remaining
  SELECT count(*) INTO v_active_count
  FROM trips
  WHERE driver_id = v_driver_id
    AND status IN ('Draft', 'Dispatched')
    AND id <> target_trip_id;

  -- If no other active trips, set driver Off Duty
  IF v_active_count = 0 THEN
    UPDATE drivers SET status = 'Off Duty' WHERE id = v_driver_id;
  END IF;
END;
$$;

-- 2. Rebuild cancel_trip to also handle Draft cancellations
--    (original only set Off Duty for Dispatched trips)
CREATE OR REPLACE FUNCTION cancel_trip(target_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id   uuid;
  v_driver_id    uuid;
  current_status trip_status;
  v_active_count integer;
BEGIN
  SELECT vehicle_id, driver_id, status INTO v_vehicle_id, v_driver_id, current_status
  FROM trips WHERE id = target_trip_id FOR UPDATE;

  IF current_status = 'Completed' OR current_status = 'Cancelled' THEN
    RAISE EXCEPTION 'Trip is already completed or cancelled.';
  END IF;

  -- If dispatched, return vehicle to Available
  IF current_status = 'Dispatched' THEN
    UPDATE vehicles SET status = 'Available' WHERE id = v_vehicle_id AND status = 'On Trip';
  END IF;

  -- Cancel the trip
  UPDATE trips SET status = 'Cancelled', end_time = now() WHERE id = target_trip_id;

  -- Check if driver has any OTHER active trips remaining
  SELECT count(*) INTO v_active_count
  FROM trips
  WHERE driver_id = v_driver_id
    AND status IN ('Draft', 'Dispatched')
    AND id <> target_trip_id;

  -- If no other active trips, set driver Off Duty
  IF v_active_count = 0 THEN
    UPDATE drivers SET status = 'Off Duty' WHERE id = v_driver_id;
  END IF;
END;
$$;

-- 3. Rebuild dispatch_trip to set driver On Duty (reconfirm)
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

  -- Set driver to On Duty
  UPDATE drivers SET status = 'On Duty'
  WHERE id = v_driver_id;

  UPDATE trips SET status = 'Dispatched', start_time = now()
  WHERE id = target_trip_id;
END;
$$;
