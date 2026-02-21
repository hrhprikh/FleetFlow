import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { FuelClient } from "@/components/fuel/fuel-client";

export default async function FuelPage() {
    const supabase = await createClient();
    const { data: fuelLogs, error } = await supabase
        .from("fuel_logs")
        .select("*, vehicle:vehicles(plate, model)")
        .order("date", { ascending: false });

    const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .order("plate");

    const { role } = await getUserProfile();

    return (
        <FuelClient
            fuelLogs={(fuelLogs ?? []) as any}
            vehicles={(vehicles ?? []) as any}
            error={error ? error.message : undefined}
            userRole={role}
        />
    );
}
