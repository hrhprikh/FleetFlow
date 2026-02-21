// ── Status & Role Types ───────────────────────────────────────

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Out of Service";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type DriverStatus = "On Duty" | "Off Duty" | "Suspended";
export type MaintenanceStatus = "Open" | "Closed";
export type ExpenseType = "fuel" | "toll" | "repair" | "other";

export type AppRole = "Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst" | "Driver";

// ── Database Row Types ────────────────────────────────────────

export interface Role {
    id: string;
    name: AppRole;
}

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    role_id: string | null;
    created_at: string;
    roles?: Role | null;
}

export interface Vehicle {
    id: string;
    plate: string;
    model: string;
    type: string;
    max_capacity: number;
    odometer: number;
    status: VehicleStatus;
    acquisition_cost: number;
    is_archived: boolean;
    created_at: string;
}

export interface Driver {
    id: string;
    name: string;
    license_no: string;
    license_expiry: string;
    license_category: string;
    status: DriverStatus;
    safety_score: number;
    trip_count: number;
    completed_trips: number;
    accidents: number;
    late_deliveries: number;
    created_at: string;
}

export interface Trip {
    id: string;
    vehicle_id: string;
    driver_id: string;
    origin: string;
    destination: string;
    cargo_weight: number;
    status: TripStatus;
    scheduled_date: string | null;
    scheduled_time: string | null;
    start_time: string | null;
    end_time: string | null;
    start_odo: number | null;
    end_odo: number | null;
    revenue: number | null;
    created_by: string | null;
    created_at: string;
    // Joined fields
    vehicle?: Pick<Vehicle, "plate" | "model"> | null;
    driver?: Pick<Driver, "name" | "license_no"> | null;
}

export interface MaintenanceLog {
    id: string;
    vehicle_id: string;
    service_type: string;
    description: string | null;
    cost: number;
    status: MaintenanceStatus;
    created_at: string;
    closed_at: string | null;
    created_by: string | null;
    // Joined
    vehicle?: Pick<Vehicle, "plate" | "model"> | null;
}

export interface FuelLog {
    id: string;
    vehicle_id: string;
    trip_id: string | null;
    expense_type: ExpenseType;
    liters: number | null;
    cost: number;
    notes: string | null;
    date: string;
    created_by: string | null;
    // Joined
    vehicle?: Pick<Vehicle, "plate" | "model"> | null;
    trip?: Pick<Trip, "origin" | "destination"> | null;
}

export interface AuditLog {
    id: string;
    actor_id: string | null;
    entity_name: string;
    entity_id: string | null;
    action: string;
    before_data: Record<string, unknown> | null;
    after_data: Record<string, unknown> | null;
    created_at: string;
}

export interface DriverNotification {
    id: string;
    driver_id: string;
    trip_id: string | null;
    title: string;
    message: string;
    payload: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

// ── Computed / API Types ──────────────────────────────────────

export interface CostSummary {
    fuel_total: number;
    maintenance_total: number;
    operational_total: number;
}

export interface DashboardKPIs {
    activeFleet: number;
    inMaintenance: number;
    utilizationRate: number;
    pendingTrips: number;
}
