"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, type UserRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
    CreateVehicleSchema,
    UpdateVehicleSchema,
    VehicleStatusSchema,
    CreateDriverSchema,
    UpdateDriverSchema,
    DriverStatusSchema,
    CreateTripSchema,
    CompleteTripSchema,
    TripIdSchema,
    CreateMaintenanceSchema,
    CloseMaintenanceSchema,
    CreateFuelLogSchema,
    parseFormData,
} from "@/lib/validations";

// ── Auth guard ────────────────────────────────────────────────

async function requireRole(allowed: UserRole[]) {
    const { role, user } = await getUserProfile();
    if (!role || !allowed.includes(role)) {
        throw new Error("You are not authorized to perform this action");
    }
    return { role, userId: user?.id ?? null };
}

// ══════════════════════════════════════════════════════════════
// VEHICLES
// ══════════════════════════════════════════════════════════════

export async function createVehicle(formData: FormData) {
    await requireRole(["Manager"]);
    const supabase = await createClient();
    const data = parseFormData(CreateVehicleSchema, formData);

    const { error } = await supabase.from("vehicles").insert({
        plate: data.plate,
        model: data.model,
        type: data.type,
        max_capacity: data.max_capacity,
        odometer: data.odometer,
        acquisition_cost: data.acquisition_cost,
        status: "Available",
    });

    if (error) {
        if (error.code === "23505") throw new Error("A vehicle with this license plate already exists");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "vehicles", "create", undefined, undefined, data as Record<string, unknown>);
}

export async function updateVehicle(formData: FormData) {
    await requireRole(["Manager"]);
    const supabase = await createClient();
    const { vehicle_id, ...payload } = parseFormData(UpdateVehicleSchema, formData);

    // Remove undefined fields
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    const { error } = await supabase.from("vehicles").update(cleanPayload).eq("id", vehicle_id);

    if (error) {
        if (error.code === "23505") throw new Error("License plate already exists");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "vehicles", "update", vehicle_id, undefined, cleanPayload);
}

export async function updateVehicleStatus(formData: FormData) {
    await requireRole(["Manager", "Dispatcher"]);
    const supabase = await createClient();
    const { vehicle_id, status } = parseFormData(VehicleStatusSchema, formData);

    const { error } = await supabase.from("vehicles").update({ status }).eq("id", vehicle_id);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "vehicles", "update_status", vehicle_id, undefined, { status });
}

export async function retireVehicle(formData: FormData) {
    await requireRole(["Manager"]);
    const supabase = await createClient();
    const vehicleId = formData.get("vehicle_id") as string;
    if (!vehicleId) throw new Error("Vehicle ID is required");

    // Check no active trips
    const { count } = await supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("vehicle_id", vehicleId)
        .in("status", ["Draft", "Dispatched"]);

    if ((count ?? 0) > 0) throw new Error("Cannot retire vehicle with active trips");

    const { error } = await supabase.from("vehicles").update({ status: "Out of Service" }).eq("id", vehicleId);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "vehicles", "retire", vehicleId, undefined, { status: "Out of Service" });
}

export async function archiveVehicle(formData: FormData) {
    await requireRole(["Manager"]);
    const supabase = await createClient();
    const vehicleId = formData.get("vehicle_id") as string;
    if (!vehicleId) throw new Error("Vehicle ID is required");

    const { error } = await supabase.from("vehicles").update({ is_archived: true }).eq("id", vehicleId);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/vehicles");
    await logAudit(supabase, "vehicles", "archive", vehicleId, undefined, { is_archived: true });
}

// ══════════════════════════════════════════════════════════════
// DRIVERS
// ══════════════════════════════════════════════════════════════

export async function createDriver(formData: FormData) {
    await requireRole(["Manager", "Safety Officer"]);
    const supabase = await createClient();
    const data = parseFormData(CreateDriverSchema, formData);

    const { error } = await supabase.from("drivers").insert({
        name: data.name,
        license_no: data.license_no,
        license_expiry: data.license_expiry,
        license_category: data.license_category,
        status: "On Duty",
        safety_score: data.safety_score,
    });

    if (error) {
        if (error.code === "23505") throw new Error("A driver with this license number already exists");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/drivers");
    await logAudit(supabase, "drivers", "create", undefined, undefined, data as Record<string, unknown>);
}

export async function updateDriver(formData: FormData) {
    await requireRole(["Manager", "Safety Officer", "Dispatcher"]);
    const supabase = await createClient();
    const { driver_id, ...payload } = parseFormData(UpdateDriverSchema, formData);

    const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    const { error } = await supabase.from("drivers").update(cleanPayload).eq("id", driver_id);

    if (error) {
        if (error.code === "23505") throw new Error("License number already exists");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/drivers");
    await logAudit(supabase, "drivers", "update", driver_id, undefined, cleanPayload);
}

export async function updateDriverStatus(formData: FormData) {
    await requireRole(["Manager", "Safety Officer", "Dispatcher"]);
    const supabase = await createClient();
    const { driver_id, status } = parseFormData(DriverStatusSchema, formData);

    const { error } = await supabase.from("drivers").update({ status }).eq("id", driver_id);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/drivers");
    revalidatePath("/dashboard/trips");
    await logAudit(supabase, "drivers", "update_status", driver_id, undefined, { status });
}

// ══════════════════════════════════════════════════════════════
// TRIPS (uses atomic DB RPCs)
// ══════════════════════════════════════════════════════════════

export async function createDraftTrip(formData: FormData) {
    const { userId } = await requireRole(["Manager", "Dispatcher"]);
    const supabase = await createClient();
    const data = parseFormData(CreateTripSchema, formData);

    // Validate vehicle capacity & availability
    const { data: vehicle, error: vErr } = await supabase
        .from("vehicles")
        .select("max_capacity, status")
        .eq("id", data.vehicle_id)
        .single();
    if (vErr || !vehicle) throw new Error("Vehicle not found");
    if (vehicle.status !== "Available") throw new Error("Selected vehicle is not available");
    if (data.cargo_weight > vehicle.max_capacity)
        throw new Error(`Cargo weight exceeds vehicle max capacity of ${vehicle.max_capacity}kg`);

    // Check no active trips for this vehicle
    const { data: activeVTrips } = await supabase
        .from("trips")
        .select("id")
        .eq("vehicle_id", data.vehicle_id)
        .in("status", ["Draft", "Dispatched"])
        .limit(1);
    if (activeVTrips && activeVTrips.length > 0)
        throw new Error("Vehicle is currently assigned to another active trip");

    // Validate driver
    const { data: driver, error: dErr } = await supabase
        .from("drivers")
        .select("status, license_expiry")
        .eq("id", data.driver_id)
        .single();
    if (dErr || !driver) throw new Error("Driver not found");
    if (driver.status === "Suspended") throw new Error("Selected driver is suspended");
    if (new Date(driver.license_expiry) < new Date()) throw new Error("Driver has an expired license");

    // Check no active trips for this driver
    const { data: activeDTrips } = await supabase
        .from("trips")
        .select("id")
        .eq("driver_id", data.driver_id)
        .in("status", ["Draft", "Dispatched"])
        .limit(1);
    if (activeDTrips && activeDTrips.length > 0)
        throw new Error("Driver is currently assigned to another active trip");

    const { error } = await supabase.from("trips").insert({
        vehicle_id: data.vehicle_id,
        driver_id: data.driver_id,
        origin: data.origin,
        destination: data.destination,
        cargo_weight: data.cargo_weight,
        revenue: data.revenue,
        scheduled_date: data.scheduled_date || null,
        scheduled_time: data.scheduled_time || null,
        status: "Draft",
        created_by: userId,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard");
    await logAudit(supabase, "trips", "create_draft", undefined, undefined, data as Record<string, unknown>);
}

export async function dispatchTrip(formData: FormData) {
    await requireRole(["Manager", "Dispatcher"]);
    const supabase = await createClient();
    const { trip_id } = parseFormData(TripIdSchema, formData);

    // Use atomic RPC
    const { error } = await supabase.rpc("dispatch_trip", { target_trip_id: trip_id });

    if (error) {
        if (error.message.includes("not in Draft")) throw new Error("Trip must be in Draft status to dispatch");
        if (error.message.includes("not currently Available")) throw new Error("Vehicle is no longer available");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "trips", "dispatch", trip_id, { status: "Draft" }, { status: "Dispatched" });
}

export async function completeTrip(formData: FormData) {
    await requireRole(["Manager", "Dispatcher"]);
    const supabase = await createClient();
    const { trip_id, final_odo, revenue } = parseFormData(CompleteTripSchema, formData);

    // Use atomic RPC
    const { error } = await supabase.rpc("complete_trip", {
        target_trip_id: trip_id,
        final_odo,
        trip_revenue: revenue,
    });

    if (error) {
        if (error.message.includes("not in Dispatched")) throw new Error("Trip must be Dispatched to complete");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "trips", "complete", trip_id, { status: "Dispatched" }, { status: "Completed", revenue });
}

export async function cancelTrip(formData: FormData) {
    await requireRole(["Manager", "Dispatcher"]);
    const supabase = await createClient();
    const { trip_id } = parseFormData(TripIdSchema, formData);

    // Use atomic RPC
    const { error } = await supabase.rpc("cancel_trip", { target_trip_id: trip_id });

    if (error) {
        if (error.message.includes("already completed or cancelled"))
            throw new Error("Trip is already completed or cancelled");
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/trips");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "trips", "cancel", trip_id);
}

// ══════════════════════════════════════════════════════════════
// MAINTENANCE (triggers auto-manage vehicle status)
// ══════════════════════════════════════════════════════════════

export async function createMaintenance(formData: FormData) {
    const { userId } = await requireRole(["Manager", "Safety Officer"]);
    const supabase = await createClient();
    const data = parseFormData(CreateMaintenanceSchema, formData);

    // The DB trigger (trg_maintenance_insert) auto-sets vehicle to "In Shop"
    const { error } = await supabase.from("maintenance_logs").insert({
        vehicle_id: data.vehicle_id,
        service_type: data.service_type,
        description: data.description,
        cost: data.cost,
        status: "Open",
        created_by: userId,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "maintenance_logs", "create", undefined, undefined, data as Record<string, unknown>);
}

export async function closeMaintenance(formData: FormData) {
    await requireRole(["Manager", "Safety Officer"]);
    const supabase = await createClient();
    const { maintenance_id } = parseFormData(CloseMaintenanceSchema, formData);

    // The DB trigger (trg_maintenance_update) auto-releases vehicle if no other open logs
    const { error } = await supabase
        .from("maintenance_logs")
        .update({ status: "Closed", closed_at: new Date().toISOString() })
        .eq("id", maintenance_id);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard");
    await logAudit(supabase, "maintenance_logs", "close", maintenance_id);
}

// ══════════════════════════════════════════════════════════════
// FUEL / EXPENSES
// ══════════════════════════════════════════════════════════════

export async function createFuelLog(formData: FormData) {
    const { userId } = await requireRole(["Manager", "Financial Analyst"]);
    const supabase = await createClient();
    const data = parseFormData(CreateFuelLogSchema, formData);

    const { error } = await supabase.from("fuel_logs").insert({
        vehicle_id: data.vehicle_id,
        trip_id: data.trip_id || null,
        expense_type: data.expense_type,
        liters: data.liters || null,
        cost: data.cost,
        notes: data.notes,
        date: data.date || new Date().toISOString(),
        created_by: userId,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/fuel");
    revalidatePath("/dashboard");
    await logAudit(supabase, "fuel_logs", "create", undefined, undefined, data as Record<string, unknown>);
}
