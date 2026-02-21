import { z } from "zod";

// ── Vehicles ──────────────────────────────────────────────────

export const CreateVehicleSchema = z.object({
    plate: z.string().min(1, "License plate is required").transform((s) => s.toUpperCase().trim()),
    model: z.string().min(1, "Model is required").transform((s) => s.trim()),
    type: z.string().min(1, "Type is required"),
    max_capacity: z.coerce.number().positive("Capacity must be positive"),
    odometer: z.coerce.number().min(0).default(0),
    acquisition_cost: z.coerce.number().min(0).default(0),
});

export const UpdateVehicleSchema = z.object({
    vehicle_id: z.string().uuid("Invalid vehicle ID"),
    plate: z.string().min(1).transform((s) => s.toUpperCase().trim()).optional(),
    model: z.string().min(1).transform((s) => s.trim()).optional(),
    type: z.string().min(1).optional(),
    max_capacity: z.coerce.number().positive().optional(),
    odometer: z.coerce.number().min(0).optional(),
    acquisition_cost: z.coerce.number().min(0).optional(),
});

export const VehicleStatusSchema = z.object({
    vehicle_id: z.string().uuid("Invalid vehicle ID"),
    status: z.enum(["Available", "On Trip", "In Shop", "Out of Service"]),
});

// ── Drivers ───────────────────────────────────────────────────

export const CreateDriverSchema = z.object({
    name: z.string().min(1, "Name is required").transform((s) => s.trim()),
    license_no: z.string().min(1, "License number is required").transform((s) => s.trim()),
    license_expiry: z.string().min(1, "License expiry is required"),
    license_category: z.string().min(1, "License category is required"),
    safety_score: z.coerce.number().min(0).max(100).default(100),
});

export const UpdateDriverSchema = z.object({
    driver_id: z.string().uuid("Invalid driver ID"),
    name: z.string().min(1).transform((s) => s.trim()).optional(),
    license_no: z.string().min(1).transform((s) => s.trim()).optional(),
    license_expiry: z.string().min(1).optional(),
    license_category: z.string().min(1).optional(),
    status: z.enum(["On Duty", "Off Duty", "Suspended"]).optional(),
    safety_score: z.coerce.number().min(0).max(100).optional(),
});

export const DriverStatusSchema = z.object({
    driver_id: z.string().uuid("Invalid driver ID"),
    status: z.enum(["On Duty", "Off Duty", "Suspended"]),
});

// ── Trips ─────────────────────────────────────────────────────

export const CreateTripSchema = z.object({
    vehicle_id: z.string().uuid("Invalid vehicle ID"),
    driver_id: z.string().uuid("Invalid driver ID"),
    origin: z.string().min(1, "Origin is required").transform((s) => s.trim()),
    destination: z.string().min(1, "Destination is required").transform((s) => s.trim()),
    cargo_weight: z.coerce.number().positive("Cargo weight must be positive"),
    revenue: z.coerce.number().min(0).default(0),
    scheduled_date: z.string().optional().nullable(),
    scheduled_time: z.string().optional().nullable(),
});

export const CompleteTripSchema = z.object({
    trip_id: z.string().uuid("Invalid trip ID"),
    final_odo: z.coerce.number().positive("Final odometer must be positive"),
    revenue: z.coerce.number().min(0).default(0),
});

export const TripIdSchema = z.object({
    trip_id: z.string().uuid("Invalid trip ID"),
});

// ── Maintenance ───────────────────────────────────────────────

export const CreateMaintenanceSchema = z.object({
    vehicle_id: z.string().uuid("Invalid vehicle ID"),
    service_type: z.string().min(1, "Service type is required"),
    description: z.string().optional().default(""),
    cost: z.coerce.number().min(0).default(0),
});

export const CloseMaintenanceSchema = z.object({
    maintenance_id: z.string().uuid("Invalid maintenance ID"),
});

// ── Fuel / Expenses ───────────────────────────────────────────

export const CreateFuelLogSchema = z.object({
    vehicle_id: z.string().uuid("Invalid vehicle ID"),
    trip_id: z.string().uuid().optional().nullable(),
    expense_type: z.enum(["fuel", "toll", "repair", "other"]).default("fuel"),
    liters: z.coerce.number().min(0).optional().nullable(),
    cost: z.coerce.number().positive("Cost must be positive"),
    notes: z.string().optional().default(""),
    date: z.string().optional(),
});

// ── Helper to parse FormData through a Zod schema ─────────────

export function parseFormData<T extends z.ZodType>(
    schema: T,
    formData: FormData
): z.infer<T> {
    const raw: Record<string, unknown> = {};
    formData.forEach((value, key) => {
        // Convert empty strings to undefined so optionals work
        raw[key] = value === "" ? undefined : value;
    });
    return schema.parse(raw);
}
