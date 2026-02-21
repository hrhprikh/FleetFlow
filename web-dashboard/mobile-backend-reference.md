# FleetFlow – Mobile Companion App Backend Reference

> **Purpose**: This document describes every table, column, enum, RPC, trigger, RLS policy, auth flow, role, and query pattern used by the FleetFlow web dashboard. The Flutter companion app **shares the same Supabase project** and must use these exact names, types, and values.

---

## 1. Environment Variables

```
SUPABASE_URL=https://vuigoapqwezfstiabign.supabase.co
SUPABASE_ANON_KEY=sb_publishable_LI7zFCtkTUj7RkJ8uoTM1A_PuhNy_uS
```

Use the **Supabase Flutter SDK** (`supabase_flutter`) with these values. The anon key is a publishable/client key — safe to embed in mobile apps. All data protection is enforced by Row Level Security (RLS) on the server.

---

## 2. Authentication

### 2.1 Auth Provider

Supabase Auth (email + password). No OAuth providers configured.

### 2.2 Auth Operations

| Operation | Supabase Method | Notes |
|---|---|---|
| **Sign In** | `auth.signInWithPassword(email, password)` | Returns session with access token + refresh token |
| **Sign Up** | `auth.signUp(email, password, data: { full_name, role })` | Triggers `handle_new_user()` which auto-creates a `profiles` row |
| **Sign Out** | `auth.signOut()` | Clears session |
| **Get User** | `auth.getUser()` | Returns current auth user object |
| **Update User** | `auth.updateUser({ data: { full_name } })` | Updates auth metadata |
| **Change Password** | `auth.updateUser({ password: newPassword })` | Min 6 characters |
| **Reset Password** | `auth.resetPasswordForEmail(email, { redirectTo })` | Sends email link |

### 2.3 Sign Up Metadata

When calling `auth.signUp()`, pass this in `options.data`:

**For web dashboard users:**
```json
{
  "full_name": "John Doe",
  "role": "Dispatcher"
}
```

**For mobile driver signup:**
```json
{
  "full_name": "Rajesh Kumar",
  "role": "Driver",
  "license_no": "MH1220210012345",
  "license_expiry": "2027-06-15",
  "license_category": "HMV"
}
```

Valid role values for signup: `"Manager"`, `"Dispatcher"`, `"Safety Officer"`, `"Financial Analyst"`, `"Driver"` (Title Case, must match the `roles` table).

> **Important for Driver signup**: The three license fields (`license_no`, `license_expiry`, `license_category`) are **required** when `role` is `"Driver"`. The trigger reads them from signup metadata to auto-create the `drivers` row.

### 2.4 Auto Profile Creation Trigger

On signup, a database trigger `on_auth_user_created` fires `handle_new_user()` which:
1. Reads `raw_user_meta_data->>'role'` (default: `'Dispatcher'`)
2. Looks up `roles.id` by case-insensitive name match
3. Falls back to Dispatcher if role name not found
4. Inserts into `profiles` table: `{ id: auth.uid(), full_name, email, role_id }`
5. **If role is `'Driver'`**: also inserts into `drivers` table with `id = auth.uid()`, reading `license_no`, `license_expiry`, and `license_category` from signup metadata

> **Key**: For drivers, `drivers.id = auth.uid()`. This means the driver's primary key IS their auth user ID. This enables simple RLS policies like `id = auth.uid()`.

### 2.5 Getting Current User's Role

Query pattern (must be done after auth):
```
profiles.select("id, full_name, email, roles ( name )").eq("id", auth.uid()).single()
```

This joins `profiles` → `roles` and returns the role name (e.g., `"Manager"`).

---

## 3. Roles & RBAC

### 3.1 Role Architecture

Roles are stored in a **separate `roles` table** (not inline text). Profiles link to roles via `role_id` FK.

### 3.2 Five Roles

| Role Name (exact string) | Description | Primary Platform |
|---|---|---|
| `Manager` | Full admin access to everything | Web |
| `Dispatcher` | Operations — create/manage/dispatch trips | Web |
| `Safety Officer` | Compliance — manage drivers, maintenance | Web |
| `Financial Analyst` | Finance — fuel/expenses, analytics, reports | Web |
| `Driver` | View own trips & notifications, update own profile | **Mobile** |

### 3.3 Permission Matrix

| Permission | Manager | Dispatcher | Safety Officer | Financial Analyst | Driver |
|---|---|---|---|---|---|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ (own) |
| View Vehicles | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create/Edit Vehicles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Vehicles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Retire/Archive Vehicle | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Drivers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Drivers | ✅ | ❌ | ✅ | ❌ | ❌ |
| Edit Drivers | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Trips | ✅ | ✅ | ✅ | ❌ | ✅ (own) |
| Create Trips | ✅ | ✅ | ❌ | ❌ | ❌ |
| Dispatch/Complete/Cancel Trip | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Maintenance | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Maintenance | ✅ | ❌ | ✅ | ❌ | ❌ |
| Edit/Close Maintenance | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Fuel & Expenses | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create Fuel Log | ✅ | ❌ | ❌ | ✅ | ❌ |
| Edit Fuel Log | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Own Notifications | ❌ | ❌ | ❌ | ❌ | ✅ |
| Update Own Driver Profile | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.4 RLS Helper Function

The database has a helper:
```sql
public.role_name() → returns text
```
Returns the current user's role name (e.g., `'Manager'`) by joining `profiles` + `roles` for `auth.uid()`. All RLS policies use this function.

---

## 4. Database Schema

### 4.1 Table: `roles`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` UNIQUE NOT NULL | `'Manager'`, `'Dispatcher'`, `'Safety Officer'`, `'Financial Analyst'`, `'Driver'` |

### 4.2 Table: `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | `text` | Nullable |
| `email` | `text` | Nullable |
| `role_id` | `uuid` | FK → `roles(id)` ON DELETE SET NULL |
| `created_at` | `timestamptz` | Default `now()` |

**RLS**: User can SELECT own row + Manager can SELECT all. User can UPDATE own row only.

### 4.3 Table: `vehicles`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `plate` | `text` UNIQUE NOT NULL | | License plate |
| `model` | `text` NOT NULL | | e.g., "Tata Ace" |
| `type` | `text` NOT NULL | | e.g., "Truck", "Van", "SUV" |
| `max_capacity` | `integer` NOT NULL | `0` | In kg |
| `odometer` | `integer` NOT NULL | `0` | Current reading |
| `status` | `vehicle_status` ENUM | `'Available'` | See enum below |
| `acquisition_cost` | `numeric(12,2)` | `0` | Purchase price |
| `is_archived` | `boolean` NOT NULL | `false` | Soft delete |
| `created_at` | `timestamptz` | `now()` | |

**Vehicle Status Enum** (exact values, Title Case):
- `'Available'`
- `'On Trip'`
- `'In Shop'`
- `'Out of Service'`

**RLS**: All authenticated can SELECT. Manager can INSERT. Manager + Dispatcher can UPDATE. Manager can DELETE.

### 4.4 Table: `drivers`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | **For Driver-role users: `id = auth.uid()`** |
| `name` | `text` NOT NULL | | Full name |
| `license_no` | `text` UNIQUE NOT NULL | | License number |
| `license_expiry` | `date` NOT NULL | | ISO date |
| `license_category` | `text` NOT NULL | | e.g., "A", "B", "LMV", "HMV" |
| `status` | `driver_status` ENUM | `'On Duty'` | See enum below |
| `safety_score` | `integer` | `100` | 0–100 |
| `trip_count` | `integer` | `0` | Total assigned trips |
| `completed_trips` | `integer` | `0` | Successfully completed |
| `accidents` | `integer` | `0` | |
| `late_deliveries` | `integer` | `0` | |
| `created_at` | `timestamptz` | `now()` | |

**Driver Status Enum** (exact values, Title Case):
- `'On Duty'`
- `'Off Duty'`
- `'Suspended'`

**RLS Policies**:
- SELECT: All authenticated users can read all drivers.
- INSERT (admin): Manager + Safety Officer can insert any driver.
- INSERT (self): Driver role can insert own row (`id = auth.uid()`) — used by `handle_new_user()` trigger.
- UPDATE (admin): Manager + Safety Officer + Dispatcher can update any driver.
- UPDATE (self): Driver role can update own row (`id = auth.uid()`) — limited to profile fields.
- DELETE: Manager only.

> **Identity Mapping**: When a user signs up with `role: "Driver"`, the trigger creates a `drivers` row with `drivers.id = auth.uid()`. This means a driver can find their own row with `.eq("id", currentUserId)` and RLS policies use `id = auth.uid()` for self-access.

### 4.5 Table: `trips`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `vehicle_id` | `uuid` NOT NULL | | FK → `vehicles(id)` CASCADE |
| `driver_id` | `uuid` NOT NULL | | FK → `drivers(id)` CASCADE |
| `origin` | `text` NOT NULL | | Start location |
| `destination` | `text` NOT NULL | | End location |
| `cargo_weight` | `integer` NOT NULL | `0` | In kg |
| `status` | `trip_status` ENUM | `'Draft'` | See enum below |
| `scheduled_date` | `date` | NULL | Optional scheduling |
| `scheduled_time` | `time` | NULL | Optional scheduling |
| `start_time` | `timestamptz` | NULL | Set by `dispatch_trip` RPC |
| `end_time` | `timestamptz` | NULL | Set by `complete_trip` / `cancel_trip` |
| `start_odo` | `integer` | NULL | Set by `complete_trip` RPC |
| `end_odo` | `integer` | NULL | Set by `complete_trip` RPC |
| `revenue` | `numeric(12,2)` | `0` | |
| `created_by` | `uuid` | NULL | FK → `profiles(id)` — who created |
| `created_at` | `timestamptz` | `now()` | |

**Trip Status Enum** (exact values, Title Case):
- `'Draft'` — Created but not dispatched
- `'Dispatched'` — Vehicle + driver assigned and active
- `'Completed'` — Trip finished
- `'Cancelled'` — Trip cancelled

**RLS**:
- SELECT: All authenticated users can read all trips. **Driver role** can also SELECT trips where `driver_id = auth.uid()`.
- INSERT: Manager + Dispatcher can create trips.
- UPDATE: Manager + Dispatcher can update trips.
- DELETE: Manager only.

### 4.6 Table: `maintenance_logs`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `vehicle_id` | `uuid` NOT NULL | | FK → `vehicles(id)` CASCADE |
| `service_type` | `text` NOT NULL | | e.g., "Oil Change", "Brake Service" |
| `description` | `text` | NULL | Optional notes |
| `cost` | `numeric(12,2)` | `0` | Service cost |
| `status` | `maintenance_status` ENUM | `'Open'` | |
| `created_by` | `uuid` | NULL | FK → `profiles(id)` |
| `created_at` | `timestamptz` | `now()` | |
| `closed_at` | `timestamptz` | NULL | Set when status → Closed |

**Maintenance Status Enum**:
- `'Open'`
- `'Closed'`

**Service Types Used in Web App**:
`"Oil Change"`, `"Tire Replacement"`, `"Brake Service"`, `"Engine Repair"`, `"Transmission"`, `"Electrical"`, `"Body Work"`, `"General Inspection"`, `"AC Service"`, `"Other"`

**RLS**: All authenticated can SELECT. Manager + Safety Officer can INSERT/UPDATE. Manager can DELETE.

**⚡ Trigger**: On INSERT with status `'Open'`, the vehicle is auto-set to `'In Shop'`. On UPDATE from `'Open'` → `'Closed'`, if no other open logs remain, vehicle is auto-released to `'Available'`.

### 4.7 Table: `fuel_logs`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `vehicle_id` | `uuid` NOT NULL | | FK → `vehicles(id)` CASCADE |
| `trip_id` | `uuid` | NULL | FK → `trips(id)` SET NULL (optional link) |
| `expense_type` | `expense_type` ENUM | `'fuel'` | See below |
| `liters` | `numeric(10,2)` | NULL | Only for fuel type |
| `cost` | `numeric(12,2)` NOT NULL | | Amount spent |
| `notes` | `text` | NULL | |
| `date` | `timestamptz` | `now()` | When expense occurred |
| `created_by` | `uuid` | NULL | FK → `profiles(id)` |

**Expense Type Enum** (lowercase):
- `'fuel'`
- `'toll'`
- `'repair'`
- `'other'`

**RLS**: All authenticated can SELECT. Manager + Financial Analyst + Dispatcher can INSERT. Manager + Financial Analyst can UPDATE. Manager can DELETE.

### 4.8 Table: `audit_logs`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `actor_id` | `uuid` | NULL | FK → `profiles(id)` — who performed the action |
| `entity_name` | `text` NOT NULL | | e.g., `"vehicles"`, `"trips"` |
| `entity_id` | `uuid` | NULL | ID of the affected row |
| `action` | `text` NOT NULL | | e.g., `"create"`, `"update"`, `"dispatch"` |
| `before_data` | `jsonb` | NULL | Previous state |
| `after_data` | `jsonb` | NULL | New state |
| `created_at` | `timestamptz` NOT NULL | `now()` | |

**RLS**: Only Manager can SELECT. Any authenticated user can INSERT.

### 4.9 Table: `driver_notifications`

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` | |
| `driver_id` | `uuid` NOT NULL | | FK → `drivers(id)` CASCADE |
| `trip_id` | `uuid` | NULL | FK → `trips(id)` SET NULL |
| `title` | `text` NOT NULL | | |
| `message` | `text` NOT NULL | | |
| `payload` | `jsonb` | NULL | Extra data |
| `is_read` | `boolean` NOT NULL | `false` | |
| `created_at` | `timestamptz` NOT NULL | `now()` | |
| `read_at` | `timestamptz` | NULL | |

**RLS**:
- SELECT: Driver can see own notifications (`driver_id = auth.uid()`). Manager, Dispatcher, and Safety Officer can see all.
- INSERT: Manager + Dispatcher can create notifications.
- UPDATE: Manager + Dispatcher can update notifications (e.g., mark read).

**Realtime**: This table is published to `supabase_realtime` — subscribe to it for push-style updates on the mobile app.

---

## 5. Database RPCs (Remote Procedure Calls)

These are **atomic server-side functions**. They must be called via `supabase.rpc()` — never replicate their logic client-side.

### 5.1 `dispatch_trip`

```
supabase.rpc("dispatch_trip", { target_trip_id: "<uuid>" })
```

**What it does atomically**:
1. Checks trip is in `'Draft'` status (error if not)
2. Sets vehicle status → `'On Trip'` (error if vehicle not `'Available'`)
3. Sets driver status → `'On Duty'`
4. Sets trip status → `'Dispatched'`, `start_time` → `now()`

### 5.2 `complete_trip`

```
supabase.rpc("complete_trip", {
  target_trip_id: "<uuid>",
  final_odo: 45000,        // integer — final odometer reading
  trip_revenue: 15000.00   // numeric — revenue for this trip
})
```

**What it does atomically**:
1. Checks trip is in `'Dispatched'` status
2. Records `start_odo` from vehicle's current odometer
3. Updates vehicle: status → `'Available'`, odometer → `max(current, final_odo)`
4. Updates driver: `trip_count += 1`, `completed_trips += 1`
5. Updates trip: status → `'Completed'`, `end_time` → `now()`, `start_odo`, `end_odo`, `revenue`

### 5.3 `cancel_trip`

```
supabase.rpc("cancel_trip", { target_trip_id: "<uuid>" })
```

**What it does atomically**:
1. Errors if trip is already `'Completed'` or `'Cancelled'`
2. If trip was `'Dispatched'`: resets vehicle → `'Available'`, driver → `'Off Duty'`
3. Sets trip status → `'Cancelled'`, `end_time` → `now()`

---

## 6. Database Triggers (automatic, no client action needed)

### 6.1 `trg_maintenance_insert`

When a maintenance_log is inserted with status `'Open'`:
→ Vehicle is automatically set to `'In Shop'`

### 6.2 `trg_maintenance_update`

When a maintenance_log status changes from `'Open'` to `'Closed'`:
→ If no other `'Open'` logs exist for that vehicle AND vehicle is `'In Shop'`:
→ Vehicle is automatically set to `'Available'`

### 6.3 `on_auth_user_created`

On user signup → auto-creates `profiles` row with `role_id` matching the signup metadata.

**For Driver role additionally**: Creates a `drivers` row with:
- `id = auth.uid()` (driver PK = auth user ID)
- `name` from signup `full_name`
- `license_no`, `license_expiry`, `license_category` from signup metadata
- Default `status = 'On Duty'`, `safety_score = 100`

---

## 7. Common Query Patterns

### 7.1 List Vehicles (non-archived)

```
supabase.from("vehicles")
  .select("*")
  .eq("is_archived", false)
  .order("created_at", { ascending: false })
```

### 7.2 List Drivers

```
supabase.from("drivers")
  .select("*")
  .order("name", { ascending: true })
```

### 7.3 List Trips with Joins

```
supabase.from("trips")
  .select("*, vehicle:vehicles(plate, model), driver:drivers(name, license_no)")
  .order("created_at", { ascending: false })
```

### 7.4 List Maintenance Logs with Vehicle

```
supabase.from("maintenance_logs")
  .select("*, vehicle:vehicles(plate, model)")
  .order("created_at", { ascending: false })
```

### 7.5 List Fuel Logs with Vehicle and Trip

```
supabase.from("fuel_logs")
  .select("*, vehicle:vehicles(plate, model), trip:trips(origin, destination)")
  .order("date", { ascending: false })
```

### 7.6 Get User Profile with Role Name

```
supabase.from("profiles")
  .select("id, full_name, email, roles ( name )")
  .eq("id", userId)
  .single()
```

The `roles ( name )` is Supabase's embedded join syntax — it follows the FK `role_id` → `roles` and returns `{ name: "Manager" }`.

### 7.7 Dashboard KPIs

```dart
// Active fleet count
await supabase.from('vehicles').select('id').eq('status', 'Available').count(CountOption.exact);

// In maintenance count
await supabase.from('vehicles').select('id').eq('status', 'In Shop').count(CountOption.exact);

// Pending trips
await supabase.from('trips').select('id').inFilter('status', ['Draft', 'Dispatched']).count(CountOption.exact);

// Available drivers
await supabase.from('drivers').select('id').eq('status', 'On Duty').count(CountOption.exact);
```

### 7.8 Filter Patterns

```
// Vehicles by status
.eq("status", "Available")

// Vehicles by type
.eq("type", "Truck")

// Search by plate or model (case-insensitive)
.or("plate.ilike.%searchTerm%,model.ilike.%searchTerm%")

// Trips by status
.in("status", ["Draft", "Dispatched"])

// Drivers with expiring licenses (next 30 days)
.lte("license_expiry", thirtyDaysFromNow)
.gte("license_expiry", today)
```

### 7.9 Driver-Specific Queries (Mobile App)

```dart
// Get my driver profile (Driver role user)
final myDriver = await supabase
    .from('drivers')
    .select('*')
    .eq('id', supabase.auth.currentUser!.id)
    .single();

// Get my trips (assigned to me)
final myTrips = await supabase
    .from('trips')
    .select('*, vehicle:vehicles(plate, model)')
    .eq('driver_id', supabase.auth.currentUser!.id)
    .order('created_at', ascending: false);

// Get my active trip (Dispatched)
final activeTrip = await supabase
    .from('trips')
    .select('*, vehicle:vehicles(plate, model)')
    .eq('driver_id', supabase.auth.currentUser!.id)
    .eq('status', 'Dispatched')
    .maybeSingle();

// Get my notifications (unread first)
final notifications = await supabase
    .from('driver_notifications')
    .select('*')
    .eq('driver_id', supabase.auth.currentUser!.id)
    .order('is_read', ascending: true)
    .order('created_at', ascending: false);

// Mark notification as read
await supabase
    .from('driver_notifications')
    .update({'is_read': true, 'read_at': DateTime.now().toUtc().toIso8601String()})
    .eq('id', notificationId);

// Update my driver profile (name, license fields)
await supabase
    .from('drivers')
    .update({'name': 'New Name', 'license_expiry': '2028-01-15'})
    .eq('id', supabase.auth.currentUser!.id);
```

---

## 8. Insert Patterns (What to Send)

### 8.1 Create Vehicle

```json
{
  "plate": "MH12AB1234",
  "model": "Tata Ace",
  "type": "Truck",
  "max_capacity": 1000,
  "odometer": 0,
  "acquisition_cost": 500000,
  "status": "Available"
}
```

### 8.2 Create Driver

```json
{
  "name": "Rajesh Kumar",
  "license_no": "MH1220210012345",
  "license_expiry": "2027-06-15",
  "license_category": "HMV",
  "status": "On Duty",
  "safety_score": 100
}
```

### 8.3 Create Draft Trip

```json
{
  "vehicle_id": "<uuid>",
  "driver_id": "<uuid>",
  "origin": "Mumbai Warehouse",
  "destination": "Pune Hub",
  "cargo_weight": 500,
  "revenue": 15000,
  "scheduled_date": "2026-03-01",
  "scheduled_time": "08:00",
  "status": "Draft",
  "created_by": "<current_user_uuid>"
}
```

**Validation before creating a trip** (web app enforces these):
- Vehicle must be `'Available'`
- No other active trips (`Draft`/`Dispatched`) for same vehicle
- Driver must be `'On Duty'`
- Driver license must not be expired
- No other active trips for same driver
- `cargo_weight` must not exceed `vehicle.max_capacity`

### 8.4 Create Maintenance Log

```json
{
  "vehicle_id": "<uuid>",
  "service_type": "Oil Change",
  "description": "Regular 10k km service",
  "cost": 2500,
  "status": "Open",
  "created_by": "<current_user_uuid>"
}
```

### 8.5 Close Maintenance Log

```json
// UPDATE where id = maintenance_id
{
  "status": "Closed",
  "closed_at": "2026-02-21T10:30:00Z"
}
```

### 8.6 Create Fuel/Expense Log

```json
{
  "vehicle_id": "<uuid>",
  "trip_id": "<uuid_or_null>",
  "expense_type": "fuel",
  "liters": 45.5,
  "cost": 4550,
  "notes": "Highway fuel stop",
  "date": "2026-02-21T10:00:00Z",
  "created_by": "<current_user_uuid>"
}
```

Note: `liters` is only relevant when `expense_type` is `'fuel'`. For toll/repair/other, set `liters` to `null`.

### 8.7 Write Audit Log

```json
{
  "actor_id": "<current_user_uuid>",
  "entity_name": "vehicles",
  "entity_id": "<uuid>",
  "action": "create",
  "before_data": null,
  "after_data": { "plate": "MH12AB1234", "model": "Tata Ace" }
}
```

### 8.8 Update Profile

```
supabase.from("profiles")
  .update({ full_name: "New Name" })
  .eq("id", currentUserId)
```

Then also:
```
supabase.auth.updateUser({ data: { full_name: "New Name" } })
```

---

## 9. Realtime Subscriptions

Both `driver_notifications` and `trips` tables are published to Supabase Realtime.

### 9.1 Driver Notifications

Subscribe to new notifications for the current driver:

```dart
final channel = supabase.channel('my-notifications');
channel
    .onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'driver_notifications',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'driver_id',
        value: supabase.auth.currentUser!.id,
      ),
      callback: (payload) {
        // payload.newRecord contains the new notification
        print('New notification: ${payload.newRecord}');
      },
    )
    .subscribe();
```

### 9.2 Trip Status Changes

Subscribe to status changes on trips assigned to the current driver:

```dart
final tripChannel = supabase.channel('my-trips');
tripChannel
    .onPostgresChanges(
      event: PostgresChangeEvent.update,
      schema: 'public',
      table: 'trips',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'driver_id',
        value: supabase.auth.currentUser!.id,
      ),
      callback: (payload) {
        // payload.newRecord['status'] — new trip status
        print('Trip updated: ${payload.newRecord}');
      },
    )
    .subscribe();
```

> **Cleanup**: Always call `supabase.removeChannel(channel)` when the screen is disposed.

---

## 10. Status Color Mapping

Use these for consistent UI across web and mobile:

### Vehicles
| Status | Color |
|---|---|
| `Available` | Emerald/Green |
| `On Trip` | Blue |
| `In Shop` | Amber/Yellow |
| `Out of Service` | Red |

### Trips
| Status | Color |
|---|---|
| `Draft` | Slate/Gray |
| `Dispatched` | Blue |
| `Completed` | Emerald/Green |
| `Cancelled` | Red |

### Drivers
| Status | Color |
|---|---|
| `On Duty` | Emerald/Green |
| `Off Duty` | Slate/Gray |
| `Suspended` | Red |

### Maintenance
| Status | Color |
|---|---|
| `Open` | Amber/Yellow |
| `Closed` | Emerald/Green |

---

## 11. Constants & Dropdown Values

### Vehicle Types
`"Sedan"`, `"SUV"`, `"Truck"`, `"Van"`, `"Bus"`, `"Pickup"`, `"Tanker"`, `"Trailer"`

### License Categories
`"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"LMV"`, `"HMV"`, `"HGMV"`, `"MCWG"`

### Service Types
`"Oil Change"`, `"Tire Replacement"`, `"Brake Service"`, `"Engine Repair"`, `"Transmission"`, `"Electrical"`, `"Body Work"`, `"General Inspection"`, `"AC Service"`, `"Other"`

### Expense Types (with display labels)
| DB Value | Display Label |
|---|---|
| `fuel` | Fuel |
| `toll` | Toll |
| `repair` | Repair |
| `other` | Other |

---

## 12. TypeScript Types → Dart Models

These are the exact shapes returned by Supabase queries. Map them to Dart classes with `fromJson` factories.

```dart
// ── Roles ──
class Role {
  final String id;        // UUID
  final String name;      // "Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst" | "Driver"

  Role({required this.id, required this.name});

  factory Role.fromJson(Map<String, dynamic> json) => Role(
    id: json['id'] as String,
    name: json['name'] as String,
  );
}

// ── Profile ──
class Profile {
  final String id;          // UUID = auth.users.id
  final String? fullName;
  final String? email;
  final String? roleId;     // FK → roles
  final String createdAt;   // ISO timestamp
  final Role? role;         // Joined via embedded select

  Profile({required this.id, this.fullName, this.email, this.roleId, required this.createdAt, this.role});

  factory Profile.fromJson(Map<String, dynamic> json) => Profile(
    id: json['id'] as String,
    fullName: json['full_name'] as String?,
    email: json['email'] as String?,
    roleId: json['role_id'] as String?,
    createdAt: json['created_at'] as String,
    role: json['roles'] != null ? Role.fromJson(json['roles']) : null,
  );
}

// ── Vehicle ──
class Vehicle {
  final String id;
  final String plate;
  final String model;
  final String type;
  final int maxCapacity;
  final int odometer;
  final String status;   // "Available" | "On Trip" | "In Shop" | "Out of Service"
  final double acquisitionCost;
  final bool isArchived;
  final String createdAt;

  Vehicle({
    required this.id, required this.plate, required this.model,
    required this.type, required this.maxCapacity, required this.odometer,
    required this.status, required this.acquisitionCost,
    required this.isArchived, required this.createdAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) => Vehicle(
    id: json['id'] as String,
    plate: json['plate'] as String,
    model: json['model'] as String,
    type: json['type'] as String,
    maxCapacity: json['max_capacity'] as int,
    odometer: json['odometer'] as int,
    status: json['status'] as String,
    acquisitionCost: (json['acquisition_cost'] as num).toDouble(),
    isArchived: json['is_archived'] as bool,
    createdAt: json['created_at'] as String,
  );
}

// ── Driver ──
class Driver {
  final String id;          // For Driver-role users: id == auth.uid()
  final String name;
  final String licenseNo;
  final String licenseExpiry;    // "YYYY-MM-DD"
  final String licenseCategory;
  final String status;           // "On Duty" | "Off Duty" | "Suspended"
  final int safetyScore;
  final int tripCount;
  final int completedTrips;
  final int accidents;
  final int lateDeliveries;
  final String createdAt;

  Driver({
    required this.id, required this.name, required this.licenseNo,
    required this.licenseExpiry, required this.licenseCategory,
    required this.status, required this.safetyScore,
    required this.tripCount, required this.completedTrips,
    required this.accidents, required this.lateDeliveries,
    required this.createdAt,
  });

  factory Driver.fromJson(Map<String, dynamic> json) => Driver(
    id: json['id'] as String,
    name: json['name'] as String,
    licenseNo: json['license_no'] as String,
    licenseExpiry: json['license_expiry'] as String,
    licenseCategory: json['license_category'] as String,
    status: json['status'] as String,
    safetyScore: json['safety_score'] as int,
    tripCount: json['trip_count'] as int,
    completedTrips: json['completed_trips'] as int,
    accidents: json['accidents'] as int,
    lateDeliveries: json['late_deliveries'] as int,
    createdAt: json['created_at'] as String,
  );
}

// ── Trip ──
class Trip {
  final String id;
  final String vehicleId;
  final String driverId;
  final String origin;
  final String destination;
  final int cargoWeight;
  final String status;         // "Draft" | "Dispatched" | "Completed" | "Cancelled"
  final String? scheduledDate; // "YYYY-MM-DD" or null
  final String? scheduledTime; // "HH:MM" or null
  final String? startTime;     // ISO timestamp
  final String? endTime;       // ISO timestamp
  final int? startOdo;
  final int? endOdo;
  final double? revenue;
  final String? createdBy;     // UUID
  final String createdAt;
  // Joined fields
  final VehicleRef? vehicle;
  final DriverRef? driver;

  Trip({
    required this.id, required this.vehicleId, required this.driverId,
    required this.origin, required this.destination, required this.cargoWeight,
    required this.status, this.scheduledDate, this.scheduledTime,
    this.startTime, this.endTime, this.startOdo, this.endOdo,
    this.revenue, this.createdBy, required this.createdAt,
    this.vehicle, this.driver,
  });

  factory Trip.fromJson(Map<String, dynamic> json) => Trip(
    id: json['id'] as String,
    vehicleId: json['vehicle_id'] as String,
    driverId: json['driver_id'] as String,
    origin: json['origin'] as String,
    destination: json['destination'] as String,
    cargoWeight: json['cargo_weight'] as int,
    status: json['status'] as String,
    scheduledDate: json['scheduled_date'] as String?,
    scheduledTime: json['scheduled_time'] as String?,
    startTime: json['start_time'] as String?,
    endTime: json['end_time'] as String?,
    startOdo: json['start_odo'] as int?,
    endOdo: json['end_odo'] as int?,
    revenue: (json['revenue'] as num?)?.toDouble(),
    createdBy: json['created_by'] as String?,
    createdAt: json['created_at'] as String,
    vehicle: json['vehicle'] != null ? VehicleRef.fromJson(json['vehicle']) : null,
    driver: json['driver'] != null ? DriverRef.fromJson(json['driver']) : null,
  );
}

class VehicleRef {
  final String plate;
  final String model;
  VehicleRef({required this.plate, required this.model});
  factory VehicleRef.fromJson(Map<String, dynamic> json) => VehicleRef(
    plate: json['plate'] as String, model: json['model'] as String,
  );
}

class DriverRef {
  final String name;
  final String licenseNo;
  DriverRef({required this.name, required this.licenseNo});
  factory DriverRef.fromJson(Map<String, dynamic> json) => DriverRef(
    name: json['name'] as String, licenseNo: json['license_no'] as String,
  );
}

// ── Maintenance Log ──
class MaintenanceLog {
  final String id;
  final String vehicleId;
  final String serviceType;
  final String? description;
  final double cost;
  final String status;       // "Open" | "Closed"
  final String? createdBy;
  final String createdAt;
  final String? closedAt;
  final VehicleRef? vehicle;

  MaintenanceLog({
    required this.id, required this.vehicleId, required this.serviceType,
    this.description, required this.cost, required this.status,
    this.createdBy, required this.createdAt, this.closedAt, this.vehicle,
  });

  factory MaintenanceLog.fromJson(Map<String, dynamic> json) => MaintenanceLog(
    id: json['id'] as String,
    vehicleId: json['vehicle_id'] as String,
    serviceType: json['service_type'] as String,
    description: json['description'] as String?,
    cost: (json['cost'] as num).toDouble(),
    status: json['status'] as String,
    createdBy: json['created_by'] as String?,
    createdAt: json['created_at'] as String,
    closedAt: json['closed_at'] as String?,
    vehicle: json['vehicle'] != null ? VehicleRef.fromJson(json['vehicle']) : null,
  );
}

// ── Fuel Log ──
class FuelLog {
  final String id;
  final String vehicleId;
  final String? tripId;
  final String expenseType;  // "fuel" | "toll" | "repair" | "other"
  final double? liters;
  final double cost;
  final String? notes;
  final String date;
  final String? createdBy;
  final VehicleRef? vehicle;

  FuelLog({
    required this.id, required this.vehicleId, this.tripId,
    required this.expenseType, this.liters, required this.cost,
    this.notes, required this.date, this.createdBy, this.vehicle,
  });

  factory FuelLog.fromJson(Map<String, dynamic> json) => FuelLog(
    id: json['id'] as String,
    vehicleId: json['vehicle_id'] as String,
    tripId: json['trip_id'] as String?,
    expenseType: json['expense_type'] as String,
    liters: (json['liters'] as num?)?.toDouble(),
    cost: (json['cost'] as num).toDouble(),
    notes: json['notes'] as String?,
    date: json['date'] as String,
    createdBy: json['created_by'] as String?,
    vehicle: json['vehicle'] != null ? VehicleRef.fromJson(json['vehicle']) : null,
  );
}

// ── Audit Log ──
class AuditLog {
  final String id;
  final String? actorId;
  final String entityName;
  final String? entityId;
  final String action;
  final Map<String, dynamic>? beforeData;
  final Map<String, dynamic>? afterData;
  final String createdAt;

  AuditLog({
    required this.id, this.actorId, required this.entityName,
    this.entityId, required this.action, this.beforeData,
    this.afterData, required this.createdAt,
  });

  factory AuditLog.fromJson(Map<String, dynamic> json) => AuditLog(
    id: json['id'] as String,
    actorId: json['actor_id'] as String?,
    entityName: json['entity_name'] as String,
    entityId: json['entity_id'] as String?,
    action: json['action'] as String,
    beforeData: json['before_data'] as Map<String, dynamic>?,
    afterData: json['after_data'] as Map<String, dynamic>?,
    createdAt: json['created_at'] as String,
  );
}

// ── Driver Notification ──
class DriverNotification {
  final String id;
  final String driverId;
  final String? tripId;
  final String title;
  final String message;
  final Map<String, dynamic>? payload;
  final bool isRead;
  final String createdAt;
  final String? readAt;

  DriverNotification({
    required this.id, required this.driverId, this.tripId,
    required this.title, required this.message, this.payload,
    required this.isRead, required this.createdAt, this.readAt,
  });

  factory DriverNotification.fromJson(Map<String, dynamic> json) => DriverNotification(
    id: json['id'] as String,
    driverId: json['driver_id'] as String,
    tripId: json['trip_id'] as String?,
    title: json['title'] as String,
    message: json['message'] as String,
    payload: json['payload'] as Map<String, dynamic>?,
    isRead: json['is_read'] as bool,
    createdAt: json['created_at'] as String,
    readAt: json['read_at'] as String?,
  );
}
```

---

## 13. Error Codes & Handling

| Supabase Error Code | Meaning | Web App Behavior |
|---|---|---|
| `23505` | Unique constraint violation | "A vehicle with this license plate already exists" / "License number already exists" |
| `42501` | RLS policy violation | "You are not authorized" |
| `PGRST116` | Row not found (`.single()`) | "Not found" |

RPC errors return the exception message from the PL/pgSQL function body, e.g.:
- `"Trip not found or not in Draft status."`
- `"Vehicle is not currently Available."`
- `"Trip is already completed or cancelled."`

---

## 14. Trip Lifecycle State Machine

```
Draft → Dispatched → Completed
  ↓         ↓
  Cancelled  Cancelled
```

- `Draft` → `Dispatched`: via `dispatch_trip` RPC
- `Dispatched` → `Completed`: via `complete_trip` RPC (requires `final_odo` and `revenue`)
- `Draft` → `Cancelled`: via `cancel_trip` RPC
- `Dispatched` → `Cancelled`: via `cancel_trip` RPC (also resets vehicle + driver)
- `Completed` → ❌ (terminal state)
- `Cancelled` → ❌ (terminal state)

---

## 15. Mobile-Specific Recommendations

1. **Use Supabase Flutter SDK** (`supabase_flutter` package on pub.dev) — it handles auth token refresh, realtime, and PostgREST queries natively.

2. **Session persistence**: The Flutter SDK auto-persists sessions using `SharedPreferences`. On app start, call `Supabase.initialize(url: ..., anonKey: ...)` and the session is restored automatically.

3. **Driver signup flow**: On the registration screen, collect `full_name`, `email`, `password`, `license_no`, `license_expiry`, `license_category`. Pass all fields as signup metadata with `role: "Driver"`. The trigger handles the rest.

4. **Driver identity**: After login, `supabase.auth.currentUser!.id` is the driver's PK in the `drivers` table. Use `.eq('id', userId)` to fetch the driver's own row — no extra lookup needed.

5. **Realtime for notifications + trips**: Subscribe to both `driver_notifications` (INSERT events) and `trips` (UPDATE events) filtered by `driver_id = auth.uid()`. Show local notifications on INSERT.

6. **Number formatting**: Always use `en_US` locale for number display to match the web dashboard (`112,000` not `1,12,000`).

7. **Date/time**: All timestamps from Supabase are ISO 8601 in UTC. Convert to local timezone for display using `DateTime.parse(ts).toLocal()`.

8. **Offline**: Supabase doesn't provide offline-first. Consider caching critical data locally (driver profile, active trip, notifications) using `sqflite` or `hive` for graceful degradation.

9. **Image/avatar**: No image upload is currently in the schema. Avatars are generated from initials.

10. **Audit logging**: The mobile app should write audit logs the same way: insert into `audit_logs` with `actor_id`, `entity_name`, `action`, `before_data`, `after_data`.

11. **Driver app screens** (suggested):
    - **Home**: Active trip card + quick stats (trip count, completed, safety score)
    - **My Trips**: List of all assigned trips with status filters
    - **Notifications**: List with unread badge count
    - **Profile**: View/edit name, license details, view safety score

---

## 16. API Routes (Optional — Direct Supabase Preferred)

The web app also has REST API routes at `/api/*` but the mobile app should use **Supabase client directly** as the SDK handles auth tokens automatically. The API routes exist only for the web app's server-side rendering.

If needed, these routes are available at `https://your-domain/api/`:
- `GET /api/dashboard/kpis`
- `GET /api/vehicles` / `POST /api/vehicles`
- `GET /api/drivers` / `POST /api/drivers`
- `GET /api/trips` / `POST /api/trips`
- `POST /api/trips/[id]/dispatch`
- `POST /api/trips/[id]/complete`
- `POST /api/trips/[id]/cancel`
- `GET /api/maintenance` / `POST /api/maintenance`
- `POST /api/maintenance/[id]/close`
- `GET /api/fuel` / `POST /api/fuel`
- `GET /api/analytics/fuel-efficiency`
- `GET /api/analytics/vehicle-roi`
- `GET /api/exports/financial?format=csv|pdf`
- `GET /api/exports/vehicle-health?format=csv|pdf`

---

## 17. Driver-Only Mobile Auth Flow (SQL + App Logic)

The mobile app is **driver-only** — only users with the `Driver` role should use it. Since Supabase Auth is shared with the web dashboard, SQL cannot selectively block non-driver logins without breaking web auth. The solution is an **app-side gate** after normal sign-in.

### 17.1 Mobile Sign-In Flow

```dart
/// 1. Normal email+password sign-in
final res = await supabase.auth.signInWithPassword(
  email: email,
  password: password,
);

/// 2. Immediately verify role == Driver
final profile = await supabase
    .from('profiles')
    .select('id, full_name, email, role_id, roles ( name )')
    .eq('id', res.user!.id)
    .single();

final roleName = (profile['roles'] as Map?)?['name'];

if (roleName != 'Driver') {
  await supabase.auth.signOut();
  throw Exception('This app is for drivers only. Please use the web dashboard.');
}

/// 3. Verify drivers row exists (identity mapping)
final driver = await supabase
    .from('drivers')
    .select('id, name, license_no, license_expiry, status, safety_score')
    .eq('id', res.user!.id)
    .maybeSingle();

if (driver == null) {
  await supabase.auth.signOut();
  throw Exception('Driver profile not found. Contact your fleet manager.');
}

/// 4. All good — proceed to home screen
```

### 17.2 Mobile Sign-Up Flow (Driver Only)

```dart
/// Collect: fullName, email, password, licenseNo, licenseExpiry, licenseCategory
final res = await supabase.auth.signUp(
  email: email,
  password: password,
  data: {
    'full_name': fullName,
    'role': 'Driver',                  // MUST be Title Case
    'license_no': licenseNo,           // e.g. "MH1220210012345"
    'license_expiry': licenseExpiry,   // e.g. "2027-06-15"
    'license_category': licenseCategory, // "LMV", "HMV", etc.
  },
);

// The handle_new_user() trigger will automatically:
// 1. Create profiles row with role_id → Driver role
// 2. Create drivers row with id = auth.uid()
//    (license_no, license_expiry, license_category from metadata)

// After signup, immediately sign in and do the same role check
// as in the sign-in flow above.
```

### 17.3 Session Restore on App Launch

```dart
/// On app cold start, check if session exists
final session = supabase.auth.currentSession;
if (session == null) {
  // → Navigate to login screen
  return;
}

/// Session exists — verify driver role is still valid
try {
  final profile = await supabase
      .from('profiles')
      .select('roles ( name )')
      .eq('id', supabase.auth.currentUser!.id)
      .single();

  if ((profile['roles'] as Map?)?['name'] != 'Driver') {
    await supabase.auth.signOut();
    // → Navigate to login screen with "role changed" message
    return;
  }

  // → Navigate to home screen
} catch (e) {
  await supabase.auth.signOut();
  // → Navigate to login screen
}
```

### 17.4 Key Identity Invariants

| Invariant | SQL Guarantee |
|---|---|
| `profiles.id = auth.users.id` | `handle_new_user()` trigger sets `profiles.id = new.id` |
| `drivers.id = auth.users.id` | `handle_new_user()` sets `drivers.id = new.id` when role = Driver |
| `trips.driver_id = drivers.id = auth.uid()` | RLS: `driver_id = auth.uid()` for own-trip visibility |
| `driver_notifications.driver_id = drivers.id = auth.uid()` | RLS: `driver_id = auth.uid()` for own notifications |

These equalities mean **one user ID chains through everything** — no extra lookups needed.

### 17.5 SQL Migrations for Mobile Setup

Run migration `0003_driver_mobile_setup.sql` which:
1. Ensures Driver role exists in `roles` table
2. Backfills `role_id` for existing users whose auth metadata says "Driver"
3. Creates missing `drivers` rows for Driver-role profiles (with TEMP- license numbers)
4. Re-asserts the `handle_new_user()` trigger
5. Validates RLS policies for driver self-access
6. Confirms realtime publication for `driver_notifications` and `trips`

### 17.6 Health Check Query

Run `supabase/driver_health_check.sql` in the Supabase SQL Editor to verify all invariants. Returns one row per check:

| # | Check | Expected |
|---|---|---|
| 1 | Driver role exists | PASS |
| 2 | Signup trigger installed | PASS |
| 3 | role_name() function exists | PASS |
| 4 | All driver profiles have drivers row | PASS |
| 5 | drivers.id = profiles.id identity mapping | PASS |
| 6 | No TEMP- license numbers | PASS (or WARN if backfilled) |
| 7 | RLS enabled on critical tables | PASS |
| 8 | driver_notifications in realtime | PASS |
| 9 | trips in realtime | PASS |
| 10 | Driver self-access policies exist | PASS |
| 11 | Expired driver licenses | PASS (or WARN) |
| 12 | Driver user count | INFO |

If any check is FAIL, run `0003_driver_mobile_setup.sql` to fix it.

### 17.7 Why Not Block Non-Driver Login in SQL?

Supabase Auth is a shared service. You could add a PostgreSQL hook or a custom claim check, but:
- It would break web dashboard logins (shared `auth.users` table)
- Supabase doesn't support per-app auth policies natively
- The app-side gate (sign in → check role → sign out if wrong) is the **standard pattern** used by multi-platform Supabase projects

The trade-off is negligible: the non-driver signs in, one SELECT runs, they get signed out. No data is exposed because RLS already prevents non-drivers from reading driver-specific data.
