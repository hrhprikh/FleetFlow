import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/lib/types";
import { getUserProfile } from "@/lib/auth";
import { VehiclesClient } from "@/components/vehicles/vehicles-client";

export default async function VehiclesPage() {
    const supabase = await createClient();
    const { role } = await getUserProfile();

    const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    return (
        <VehiclesClient
            vehicles={(vehicles as Vehicle[]) ?? []}
            error={error?.message}
            userRole={role}
        />
    );
}
