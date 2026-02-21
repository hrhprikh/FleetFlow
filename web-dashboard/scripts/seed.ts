import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables. Run this with --env-file=.env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const generateRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

async function seed() {
    console.log("🌱 Starting Seed Process...");

    // 1. Seed Vehicles
    console.log("Seeding Vehicles...");
    const { data: vehicles, error: vError } = await supabase.from("vehicles").insert([
        { plate: "SEED-100", model: "Tesla Semi", type: "Heavy", max_capacity: 35000, odometer: 15400, status: "Available", acquisition_cost: 150000 },
        { plate: "SEED-101", model: "Ford Transit", type: "Light", max_capacity: 3500, odometer: 42000, status: "Available", acquisition_cost: 45000 },
        { plate: "SEED-102", model: "Volvo FH16", type: "Heavy", max_capacity: 40000, odometer: 112000, status: "In Shop", acquisition_cost: 130000 },
        { plate: "SEED-103", model: "Mercedes Sprinter", type: "Medium", max_capacity: 6000, odometer: 8500, status: "Available", acquisition_cost: 65000 },
        { plate: "SEED-104", model: "Tesla Semi", type: "Heavy", max_capacity: 35000, odometer: 500, status: "Out of Service", acquisition_cost: 150000 },
    ]).select();

    if (vError) {
        console.warn("  - Error or duplicates on vehicles:", vError.message);
    } else {
        console.log(`  - Inserted ${vehicles?.length || 0} vehicles.`);
    }

    // 2. Seed Drivers
    console.log("Seeding Drivers...");
    const { data: drivers, error: dError } = await supabase.from("drivers").insert([
        { name: "Alice Seed", license_no: "LIC-S001", license_expiry: generateRandomDate(new Date(), new Date(2028, 1, 1)), license_category: "CDL-A", status: "On Duty", safety_score: 98, completed_trips: 15 },
        { name: "Bob Seed", license_no: "LIC-S002", license_expiry: generateRandomDate(new Date(), new Date(2027, 1, 1)), license_category: "CDL-B", status: "On Duty", safety_score: 85, completed_trips: 42 },
        { name: "Charlie Seed", license_no: "LIC-S003", license_expiry: "2023-01-01", license_category: "CDL-A", status: "Suspended", safety_score: 45, completed_trips: 3 },
    ]).select();

    if (dError) {
        console.warn("  - Error or duplicates on drivers:", dError.message);
    } else {
        console.log(`  - Inserted ${drivers?.length || 0} drivers.`);
    }

    // 3. Seed Maintenance Logs
    console.log("Seeding Maintenance Logs...");
    const { data: maintLogs, error: mError } = await supabase.from("maintenance_logs").insert([
        { vehicle_id: vehicles?.[2]?.id, service_type: "Engine Overhaul", description: "Complete rebuild of engine block", cost: 12500, status: "Open" }, // For In Shop vehicle
        { vehicle_id: vehicles?.[0]?.id, service_type: "Tire Replacement", description: "Replaced all 18 tires", cost: 4500, status: "Closed", closed_at: new Date().toISOString() },
        { vehicle_id: vehicles?.[1]?.id, service_type: "Oil Change", description: "Standard synthetic oil change", cost: 120, status: "Closed", closed_at: new Date().toISOString() },
    ]).select();

    if (mError) {
        console.warn("  - Error seeding maintenance logs:", mError.message);
    } else {
        console.log(`  - Inserted ${maintLogs?.length || 0} maintenance logs.`);
    }

    // 4. Seed Trips
    console.log("Seeding Trips...");
    const { data: trips, error: tError } = await supabase.from("trips").insert([
        { vehicle_id: vehicles?.[0]?.id, driver_id: drivers?.[0]?.id, origin: "Chicago, IL", destination: "Atlanta, GA", cargo_weight: 28000, revenue: 3500, start_odo: 14000, end_odo: 15400, status: "Completed", start_time: generateRandomDate(new Date(2023, 1, 1), new Date()), end_time: new Date().toISOString() },
        { vehicle_id: vehicles?.[1]?.id, driver_id: drivers?.[1]?.id, origin: "Austin, TX", destination: "Houston, TX", cargo_weight: 2500, revenue: 500, start_odo: 41800, end_odo: 42000, status: "Completed", start_time: generateRandomDate(new Date(2023, 1, 1), new Date()), end_time: new Date().toISOString() },
        { vehicle_id: vehicles?.[3]?.id, driver_id: drivers?.[1]?.id, origin: "Seattle, WA", destination: "Portland, OR", cargo_weight: 4500, revenue: 0, status: "Draft" },
    ]).select();

    if (tError) {
        console.warn("  - Error seeding trips:", tError.message);
    } else {
        console.log(`  - Inserted ${trips?.length || 0} trips.`);
    }

    // 5. Seed Fuel Logs
    console.log("Seeding Fuel Logs...");
    const { data: fuelLogs, error: fError } = await supabase.from("fuel_logs").insert([
        { vehicle_id: vehicles?.[0]?.id, trip_id: trips?.[0]?.id, liters: 750, cost: 850, date: trips?.[0]?.start_time || new Date().toISOString() },
        { vehicle_id: vehicles?.[1]?.id, trip_id: trips?.[1]?.id, liters: 40, cost: 55, date: trips?.[1]?.start_time || new Date().toISOString() },
        { vehicle_id: vehicles?.[2]?.id, trip_id: null, liters: 120, cost: 160, date: generateRandomDate(new Date(2023, 1, 1), new Date()) },
    ]);

    if (fError) {
        console.warn("  - Error seeding fuel logs:", fError.message);
    } else {
        console.log(`  - Inserted fuel logs.`);
    }

    console.log("✅ Seed process complete!");
}

seed();
