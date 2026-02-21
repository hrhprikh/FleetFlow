# FleetFlow Mobile Companion Architecture (Flutter + Supabase)

**Date:** 21 Feb 2026  
**Status:** Aligned with current FleetFlow web backend implementation

## 1) Purpose

This document explains how the Flutter mobile app should integrate with the existing Supabase backend so behavior matches the web app and remains secure, role-aware, and production-safe.

It is based on:
- `supabase/migrations/0001_init.sql`
- `app/actions.ts`
- `app/(auth)/auth-actions.ts`
- `middleware.ts`
- `app/api/exports/*`

---

## 2) Current Supabase System Snapshot

### Core tables
- `profiles` (user profile + role)
- `vehicles`
- `drivers`
- `trips`
- `maintenance_logs`
- `fuel_expenses`
- `audit_logs`

### Role model
- `manager`
- `dispatcher`
- `safety_officer`
- `financial`

Role is stored in `profiles.role` and resolved by SQL function `public.current_role()`.

### Auth/profile lifecycle
- Users are created in `auth.users` (Supabase Auth).
- Trigger `handle_new_user()` creates or updates `public.profiles`.
- Role comes from `raw_user_meta_data.role` (default `dispatcher`).

### Security model
- RLS is enabled on all business tables.
- Policies are role-based through `current_role()` and `auth.uid()`.
- This means Flutter can safely use Supabase client with anon key (never service key), while DB policies enforce access.

---

## 3) What Flutter Should Connect To

## Use directly from Flutter
Use Supabase Flutter SDK for:
- Authentication (`signInWithPassword`, `signUp`, `resetPasswordForEmail`, `signOut`)
- Read queries (all role-permitted data)
- Simple inserts/updates where business invariants are trivial
- Realtime streams (trips, vehicles, dashboard cards)

## Use backend function/API (not direct mobile write)
For workflow transitions that update multiple tables and require invariant checks, do **not** perform raw multi-step logic in the app. Use a trusted backend path:
- Supabase Edge Functions **or** Postgres RPC functions (recommended)
- Optional: dedicated Next.js API endpoints (if your mobile app shares the same deployment)

Reason: current web app uses server actions in `app/actions.ts` with cross-table logic. Mobile should call one atomic backend operation, not duplicate business logic client-side.

---

## 4) Data + Workflow Rules Mobile Must Preserve

These are enforced in web server actions and should be mirrored for mobile calls:

1. **Create Draft Trip**
   - vehicle exists
   - cargo <= vehicle.max_capacity
   - driver exists
   - driver license not expired
   - driver.license_category matches vehicle.type

2. **Dispatch Trip**
   - trip status must be `draft`
   - vehicle must be `available`
   - driver must be `off_duty`
   - on success:
     - trip -> `on_trip` + `dispatched_at`
     - vehicle -> `on_trip`
     - driver -> `on_duty`

3. **Complete Trip**
   - trip status must be `on_trip`
   - end odometer valid
   - on success:
     - trip -> `completed` + `end_odometer` + `revenue`
     - vehicle -> `available` + `current_odometer=end_odometer`
     - driver -> `off_duty`

4. **Maintenance Create / Resolve**
   - create maintenance sets vehicle `in_shop`
   - resolving maintenance sets vehicle `available`

5. **Vehicle Retirement Constraint**
   - vehicle cannot retire if active (`on_trip`) trips exist

6. **Audit Logging**
   - critical writes should insert into `audit_logs`

---

## 5) Recommended Mobile Backend Contract

Create explicit backend operations callable by Flutter:

- `create_draft_trip(payload)`
- `dispatch_trip(trip_id)`
- `complete_trip(trip_id, end_odometer, revenue)`
- `cancel_draft_trip(trip_id)`
- `log_maintenance(payload)`
- `resolve_maintenance(maintenance_id, vehicle_id)`
- `retire_vehicle(vehicle_id)`
- `archive_vehicle(vehicle_id)`
- `log_expense(payload)`

### Implementation options
- **Best fit:** SQL RPC + transactions + RLS-aware logic
- **Alternative:** Supabase Edge Functions with service role internally + custom auth checks

Keep one source of truth for business logic. Avoid re-implementing validation in both web and Flutter separately.

---

## 6) Flutter App Layering (Reference)

Use this clean architecture split:

1. **Data Layer**
   - `SupabaseAuthDataSource`
   - `SupabaseFleetDataSource`
   - DTOs matching current table schema

2. **Domain Layer**
   - use cases: `DispatchTrip`, `CompleteTrip`, `CreateVehicle`, etc.
   - each use case calls either direct table ops or RPC endpoint

3. **Presentation Layer**
   - role-aware routing and menu
   - realtime state streams for active trips, vehicle status, alerts

4. **Session Layer**
   - persist auth session using Supabase Flutter local storage
   - resolve role from `profiles` after login

---

## 7) RBAC Expectations for Mobile UI

Mirror web RBAC navigation:

- `manager`: dashboard, vehicles, trips, maintenance, expenses, drivers, analytics
- `dispatcher`: dashboard, vehicles (read-focused), trips
- `safety_officer`: dashboard, maintenance, drivers
- `financial`: dashboard, expenses, analytics

UI role checks improve UX, but DB RLS remains the true enforcement layer.

---

## 8) Realtime Strategy for Mobile

Subscribe to:
- `trips` (status and dispatch lifecycle)
- `vehicles` (availability / in_shop / on_trip)
- `drivers` (duty status)
- optional KPI refresh trigger through lightweight periodic recompute

Guidelines:
- keep subscriptions only on active screens
- debounce list refreshes
- reconnect gracefully on app resume

---

## 9) Environment and Key Management

For Flutter app:
- include only:
  - `SUPABASE_URL` (public)
  - `SUPABASE_ANON_KEY` (public anon)
- **never include** `SUPABASE_SERVICE_ROLE_KEY` in mobile app, repo, or client bundle

If service key was exposed in shared screenshots/files, rotate it immediately in Supabase dashboard.

---

## 10) Parity Checklist (Web ↔ Flutter)

Before release, confirm:
- same role matrix as web
- same status transitions for trip/vehicle/driver
- same validation rules for capacity, license expiry, license category
- maintenance workflow updates vehicle state correctly
- expense logging rules match web behavior
- unauthorized role attempts fail due to RLS
- critical mutations produce audit logs

---

## 11) Practical Next Step (Recommended)

To make mobile integration robust and avoid logic drift, extract the current multi-step logic from `app/actions.ts` into database RPC functions (or Edge Functions), then have both web and Flutter call those same operations.

That gives:
- one validation engine
- atomic updates
- consistent behavior across platforms
- lower long-term maintenance cost
