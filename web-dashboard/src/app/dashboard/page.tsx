import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { ManagerDashboard } from "@/components/dashboards/manager-dashboard";
import { DispatcherDashboard } from "@/components/dashboards/dispatcher-dashboard";
import { SafetyDashboard } from "@/components/dashboards/safety-dashboard";
import { FinanceDashboard } from "@/components/dashboards/finance-dashboard";

async function getKPIs() {
    const supabase = await createClient();

    const [vehiclesRes, tripsRes, driversRes, maintenanceRes] = await Promise.all(
        [
            supabase.from("vehicles").select("id, status"),
            supabase.from("trips").select("id, status"),
            supabase.from("drivers").select("id, status"),
            supabase.from("maintenance_logs").select("id, status"),
        ]
    );

    const vehicles = vehiclesRes.data || [];
    const trips = tripsRes.data || [];
    const drivers = driversRes.data || [];
    const maintenance = maintenanceRes.data || [];

    const activeFleet = vehicles.filter((v) => v.status === "On Trip").length;
    const inMaintenance = vehicles.filter((v) => v.status === "In Shop").length;
    const availableVehicles = vehicles.filter(
        (v) => v.status === "Available"
    ).length;
    const assignable = activeFleet + availableVehicles;
    const utilizationRate =
        assignable > 0 ? Math.round((activeFleet / assignable) * 100) : 0;
    const pendingTrips = trips.filter((t) => t.status === "Draft").length;

    return {
        active_fleet: activeFleet,
        in_maintenance: inMaintenance,
        utilization_rate: utilizationRate,
        pending_trips: pendingTrips,
        total_vehicles: vehicles.length,
        total_drivers: drivers.length,
        available_vehicles: availableVehicles,
        completed_trips: trips.filter((t) => t.status === "Completed").length,
        open_maintenance: maintenance.filter((m) => m.status === "Open").length,
        on_duty_drivers: drivers.filter((d) => d.status === "On Duty").length,
    };
}

export default async function DashboardPage() {
    let kpis;
    try {
        kpis = await getKPIs();
    } catch {
        kpis = null;
    }

    const { role } = await getUserProfile();

    switch (role) {
        case "Dispatcher":
            return <DispatcherDashboard kpis={kpis} />;
        case "Safety Officer":
            return <SafetyDashboard kpis={kpis} />;
        case "Financial Analyst":
            return <FinanceDashboard kpis={kpis} />;
        case "Manager":
        default:
            return <ManagerDashboard kpis={kpis} />;
    }
}
