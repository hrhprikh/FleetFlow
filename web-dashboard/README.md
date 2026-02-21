# FleetFlow

A full-stack fleet management system built with **Next.js** (web dashboard) and **Flutter** (driver mobile app), powered by **Supabase** as the backend.

FleetFlow streamlines fleet operations — vehicle tracking, trip lifecycle management, driver management, maintenance scheduling, fuel/expense logging, and real-time analytics — all under a single platform with role-based access control.

---

## Screenshots

### Web Dashboard

| Login Page | Manager Dashboard |
|:---:|:---:|
| ![Login](screenshots/Screenshot%202026-02-21%20170438.png) | ![Dashboard](screenshots/Screenshot%202026-02-21%20170428.png) |

| Trips & Dispatch | Driver Management |
|:---:|:---:|
| ![Trips](screenshots/Screenshot%202026-02-21%20171029.png) | ![Drivers](screenshots/Screenshot%202026-02-21%20171044.png) |

### Flutter Mobile App (Driver)

| Login | Register | Driver Dashboard |
|:---:|:---:|:---:|
| ![Mobile Login](screenshots/WhatsApp%20Image%202026-02-21%20at%205.09.39%20PM%20(1).jpeg) | ![Mobile Register](screenshots/WhatsApp%20Image%202026-02-21%20at%205.09.39%20PM.jpeg) | ![Driver Dashboard](screenshots/WhatsApp%20Image%202026-02-21%20at%205.08.28%20PM.jpeg) |

| Trip Details | Start Trip |
|:---:|:---:|
| ![Trip Details](screenshots/WhatsApp%20Image%202026-02-21%20at%205.08.28%20PM%20(1).jpeg) | ![Start Trip](screenshots/WhatsApp%20Image%202026-02-21%20at%205.08.29%20PM.jpeg) |

---

## Tech Stack

### Web Dashboard
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Auth & Database | Supabase (Auth, PostgREST, RLS, Realtime) |

### Mobile App
| Layer | Technology |
|-------|-----------|
| Framework | Flutter |
| Language | Dart |
| Backend | Supabase (shared with web) |
| Target | Android |

---

## Features

### Core Modules
- **Vehicle Management** — Add, edit, track vehicles with status (Available, On Trip, In Shop, Out of Service), odometer, and capacity tracking
- **Trip Lifecycle** — Full lifecycle from Draft → Dispatched → Completed / Cancelled, with automatic driver status management
- **Driver Management** — Driver profiles with automatic On Duty / Off Duty status based on active trips
- **Maintenance Logs** — Track service records, costs, and open/closed status per vehicle
- **Fuel & Expenses** — Log fuel entries, tolls, repairs, and other expenses with per-liter rate calculations
- **Analytics & Reports** — Fuel efficiency per vehicle, vehicle ROI analysis, monthly spend charts, CSV/PDF exports

### Role-Based Access Control (RBAC)
| Role | Access |
|------|--------|
| **Manager** | Full access to all modules, fleet overview dashboard |
| **Dispatcher** | Trip management, vehicle & driver assignments |
| **Safety Officer** | Vehicle inspections, maintenance oversight |
| **Financial Analyst** | Expense tracking, revenue analytics, financial reports |
| **Driver** | Mobile app — view assigned trips, dispatch, complete, log fuel |

### Driver Status Automation
Driver status is **automatically managed** by the system:
- **On Duty** — Automatically set when a trip is dispatched
- **Off Duty** — Automatically set when all active trips are completed or cancelled
- No manual status toggling required

### Currency
All monetary values are displayed in **Indian Rupees (₹)** with `en-IN` locale formatting.

---

## Project Structure

```
FleetFlow/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── vehicles/       # Vehicle management
│   │   │   ├── trips/          # Trip management
│   │   │   ├── drivers/        # Driver management
│   │   │   ├── maintenance/    # Maintenance logs
│   │   │   ├── fuel/           # Fuel & expenses
│   │   │   ├── analytics/      # Reports & charts
│   │   │   └── profile/        # User profile
│   │   ├── api/                # API routes
│   │   └── login/              # Authentication
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── dashboards/         # Role-specific dashboards
│   │   ├── analytics/          # Charts & export buttons
│   │   ├── vehicles/           # Vehicle components
│   │   ├── trips/              # Trip components
│   │   ├── drivers/            # Driver components
│   │   ├── maintenance/        # Maintenance components
│   │   └── fuel/               # Fuel/expense components
│   └── lib/
│       ├── auth.ts             # Authentication helpers
│       ├── permissions.ts      # RBAC permission system
│       ├── types.ts            # TypeScript type definitions
│       └── supabase/           # Supabase client (server/client)
├── supabase/
│   ├── schema.sql              # Database schema
│   └── migrations/             # SQL migrations
└── screenshots/                # App screenshots
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- A Supabase project

### 1. Clone & Install

```bash
git clone <repo-url>
cd FleetFlow
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the SQL migrations in your Supabase SQL Editor in order:
1. `supabase/schema.sql` — Base schema with tables, RLS policies, and RPCs
2. `supabase/migrations/0004_auto_driver_status.sql` — Driver status automation

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### 5. Test Accounts

Use the quick login buttons on the login page to sign in as any role. Default test password: `pass123`

---

## Flutter Mobile App

The **FleetFlow Driver App** is a companion Android application built with Flutter, designed exclusively for drivers.

### Mobile App Features
- **Driver Dashboard** — View assigned vehicle, today's trips, and current duty status
- **Trip Management** — View trip details, dispatch trips with odometer reading, and complete trips
- **Fuel Logging** — Log fuel entries directly from the field
- **Maintenance Reporting** — Report vehicle issues on the go
- **Real-time Sync** — Shared Supabase backend ensures instant data sync between web and mobile

### Mobile Screenshots

<p align="center">
  <img src="screenshots/WhatsApp%20Image%202026-02-21%20at%205.09.39%20PM%20(1).jpeg" width="220" alt="Mobile Login" />
  &nbsp;&nbsp;
  <img src="screenshots/WhatsApp%20Image%202026-02-21%20at%205.09.39%20PM.jpeg" width="220" alt="Mobile Register" />
  &nbsp;&nbsp;
  <img src="screenshots/WhatsApp%20Image%202026-02-21%20at%205.08.28%20PM.jpeg" width="220" alt="Driver Dashboard" />
  &nbsp;&nbsp;
  <img src="screenshots/WhatsApp%20Image%202026-02-21%20at%205.08.28%20PM%20(1).jpeg" width="220" alt="Trip Details" />
  &nbsp;&nbsp;
  <img src="screenshots/WhatsApp%20Image%202026-02-21%20at%205.08.29%20PM.jpeg" width="220" alt="Start Trip" />
</p>

---

## Database Architecture

The system uses PostgreSQL (via Supabase) with:
- **Row Level Security (RLS)** for data protection
- **Atomic RPCs** (`dispatch_trip`, `complete_trip`, `cancel_trip`) for transactional trip state management
- **Automatic driver status updates** within RPCs — no application-level race conditions
- **Audit logging** for all state-changing operations

---

## License

This project is for educational/demonstration purposes.
