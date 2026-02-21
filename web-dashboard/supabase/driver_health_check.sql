-- ══════════════════════════════════════════════════════════════════
-- FleetFlow – Driver Mobile Health Check
-- Run this anytime to verify all invariants for the mobile app.
-- Returns one row per check with PASS / FAIL status.
-- ══════════════════════════════════════════════════════════════════

WITH checks AS (

  -- 1. Driver role exists in roles table
  SELECT
    1 AS seq,
    'Driver role exists' AS check_name,
    CASE WHEN EXISTS (SELECT 1 FROM public.roles WHERE name = 'Driver')
         THEN 'PASS' ELSE 'FAIL' END AS status,
    (SELECT id::text FROM public.roles WHERE name = 'Driver') AS detail

  UNION ALL

  -- 2. handle_new_user trigger is installed on auth.users
  SELECT
    2,
    'Signup trigger installed',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers
      WHERE event_object_schema = 'auth'
        AND event_object_table  = 'users'
        AND trigger_name        = 'on_auth_user_created'
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 3. role_name() helper function exists
  SELECT
    3,
    'role_name() function exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'role_name'
        AND pronamespace = 'public'::regnamespace
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 4. All Driver-role profiles have a matching drivers row
  SELECT
    4,
    'All driver profiles have drivers row',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id AND r.name = 'Driver'
      LEFT JOIN public.drivers d ON d.id = p.id
      WHERE d.id IS NULL
    ) THEN 'PASS' ELSE 'FAIL' END,
    (SELECT count(*)::text
     FROM public.profiles p
     JOIN public.roles r ON r.id = p.role_id AND r.name = 'Driver'
     LEFT JOIN public.drivers d ON d.id = p.id
     WHERE d.id IS NULL)

  UNION ALL

  -- 5. All Driver-role drivers.id = profiles.id (identity mapping)
  SELECT
    5,
    'drivers.id = profiles.id for all drivers',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id AND r.name = 'Driver'
      JOIN public.drivers d ON d.id = p.id
      WHERE d.id <> p.id
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 6. No TEMP- license numbers remain (backfill cleanup check)
  SELECT
    6,
    'No TEMP- license numbers',
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM public.drivers WHERE license_no LIKE 'TEMP-%'
    ) THEN 'PASS' ELSE 'WARN' END,
    (SELECT count(*)::text FROM public.drivers WHERE license_no LIKE 'TEMP-%')
    || ' temp licenses remaining'

  UNION ALL

  -- 7. RLS is enabled on all driver-critical tables
  SELECT
    7,
    'RLS enabled on critical tables',
    CASE WHEN (
      SELECT bool_and(rowsecurity)
      FROM pg_class
      WHERE relname IN ('profiles','drivers','trips','driver_notifications')
        AND relnamespace = 'public'::regnamespace
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 8. driver_notifications is in supabase_realtime publication
  SELECT
    8,
    'driver_notifications in realtime',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND tablename = 'driver_notifications'
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 9. trips is in supabase_realtime publication
  SELECT
    9,
    'trips in realtime',
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND tablename = 'trips'
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 10. RLS policies exist for driver self-access
  SELECT
    10,
    'Driver self-access policies exist',
    CASE WHEN (
      EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers'              AND policyname = 'drivers_update_self')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'driver_notifications' AND policyname = 'notifications_select')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles'             AND policyname = 'profiles_update_own')
    ) THEN 'PASS' ELSE 'FAIL' END,
    NULL

  UNION ALL

  -- 11. No expired driver licenses (informational)
  SELECT
    11,
    'Expired driver licenses',
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM public.drivers WHERE license_expiry < current_date
    ) THEN 'PASS' ELSE 'WARN' END,
    (SELECT count(*)::text FROM public.drivers WHERE license_expiry < current_date)
    || ' expired licenses'

  UNION ALL

  -- 12. Total driver-role count summary
  SELECT
    12,
    'Driver user count',
    'INFO',
    (SELECT count(*)::text
     FROM public.profiles p
     JOIN public.roles r ON r.id = p.role_id AND r.name = 'Driver')
    || ' driver users registered'

)
SELECT seq AS "#", check_name AS "Check", status AS "Result", detail AS "Detail"
FROM checks
ORDER BY seq;
