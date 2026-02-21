import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { MaintenanceClient } from "@/components/maintenance/maintenance-client";

export default async function MaintenancePage() {
    const supabase = await createClient();
    const { data: logs, error } = await supabase
        .from("maintenance_logs")
        .select("*, vehicle:vehicles(plate, model)")
        .order("created_at", { ascending: false });

    const { data: availableVehicles } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "Available")
        .order("plate");

    const { role } = await getUserProfile();

    return (
        <MaintenanceClient
            logs={(logs ?? []) as any}
            vehicles={(availableVehicles ?? []) as any}
            error={error ? error.message : undefined}
            userRole={role}
        />
    );
}
