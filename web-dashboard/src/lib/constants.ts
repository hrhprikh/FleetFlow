// ── Status Enums ──────────────────────────────────────────────

export const VEHICLE_STATUS = {
    AVAILABLE: "Available",
    ON_TRIP: "On Trip",
    IN_SHOP: "In Shop",
    RETIRED: "Out of Service",
} as const;

export const TRIP_STATUS = {
    DRAFT: "Draft",
    DISPATCHED: "Dispatched",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
} as const;

export const DRIVER_STATUS = {
    ON_DUTY: "On Duty",
    OFF_DUTY: "Off Duty",
    SUSPENDED: "Suspended",
} as const;

export const MAINTENANCE_STATUS = {
    OPEN: "Open",
    CLOSED: "Closed",
} as const;

// ── Expense Types (fuel_logs.expense_type — matches DB enum) ──

export const EXPENSE_TYPES = [
    "fuel",
    "toll",
    "repair",
    "other",
] as const;

/** Display label for expense types */
export const EXPENSE_TYPE_LABELS: Record<string, string> = {
    fuel: "Fuel",
    toll: "Toll",
    repair: "Repair",
    other: "Other",
};

// ── Roles ─────────────────────────────────────────────────────

export const ROLES = {
    MANAGER: "Manager",
    DISPATCHER: "Dispatcher",
    SAFETY: "Safety Officer",
    FINANCE: "Financial Analyst",
    DRIVER: "Driver",
} as const;

// ── Status Colors (for Badge variants) ────────────────────────

export const STATUS_COLORS: Record<string, string> = {
    // Vehicle — pastel bg + strong readable text (Odoo pill style)
    Available: "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]",
    "On Trip": "bg-[#DBEAFE] text-[#1D4ED8] border-[#DBEAFE]",
    "In Shop": "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",
    "Out of Service": "bg-[#FEE2E2] text-[#991B1B] border-[#FEE2E2]",

    // Trip
    Draft: "bg-gray-100 text-gray-600 border-gray-100",
    Dispatched: "bg-[#DBEAFE] text-[#1D4ED8] border-[#DBEAFE]",
    Completed: "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]",
    Cancelled: "bg-[#FEE2E2] text-[#991B1B] border-[#FEE2E2]",

    // Driver
    "On Duty": "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]",
    "Off Duty": "bg-gray-100 text-gray-600 border-gray-100",
    Suspended: "bg-[#FEE2E2] text-[#991B1B] border-[#FEE2E2]",

    // Maintenance
    Open: "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",
    Closed: "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]",
};

// ── Vehicle Types ─────────────────────────────────────────────

export const VEHICLE_TYPES = [
    "Sedan",
    "SUV",
    "Truck",
    "Van",
    "Bus",
    "Pickup",
    "Tanker",
    "Trailer",
] as const;

// ── License Categories ────────────────────────────────────────

export const LICENSE_CATEGORIES = [
    "A", "B", "C", "D", "E",
    "LMV", "HMV", "HGMV", "MCWG",
] as const;

// ── Service Types ─────────────────────────────────────────────

export const SERVICE_TYPES = [
    "Oil Change",
    "Tire Replacement",
    "Brake Service",
    "Engine Repair",
    "Transmission",
    "Electrical",
    "Body Work",
    "General Inspection",
    "AC Service",
    "Other",
] as const;

import type { AppRole } from "./types";

// ── Navigation ────────────────────────────────────────────────

export type NavItem = {
    title: string;
    href: string;
    icon: string;
    description: string;
    allowedRoles?: AppRole[];
};

export const NAV_ITEMS: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        description: "Command center & KPIs",
        // All roles can see dashboard
    },
    {
        title: "Vehicles",
        href: "/dashboard/vehicles",
        icon: "Truck",
        description: "Fleet asset management",
        allowedRoles: ["Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] // All can view, edit rights are separate
    },
    {
        title: "Drivers",
        href: "/dashboard/drivers",
        icon: "Users",
        description: "Driver profiles & safety",
        allowedRoles: ["Manager", "Dispatcher", "Safety Officer"] // Finance cannot view drivers
    },
    {
        title: "Trips",
        href: "/dashboard/trips",
        icon: "Route",
        description: "Dispatch & trip lifecycle",
        allowedRoles: ["Manager", "Dispatcher", "Safety Officer"] // Finance cannot view trips (except revenue in analytics)
    },
    {
        title: "Maintenance",
        href: "/dashboard/maintenance",
        icon: "Wrench",
        description: "Service logs & scheduling",
        allowedRoles: ["Manager", "Safety Officer", "Dispatcher", "Financial Analyst"] // Dispatcher & Finance read-only
    },
    {
        title: "Fuel & Expenses",
        href: "/dashboard/fuel",
        icon: "Fuel",
        description: "Cost tracking & fuel logs",
        allowedRoles: ["Manager", "Financial Analyst"] // Only Manager and Finance handle fuel
    },
    {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: "BarChart3",
        description: "Reports & insights",
        allowedRoles: ["Manager", "Financial Analyst"] // Only Manager and Finance
    },
];
