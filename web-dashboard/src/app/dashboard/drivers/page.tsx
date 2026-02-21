import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { DriversClient } from "@/components/drivers/drivers-client";

export default async function DriversPage() {
    const supabase = await createClient();
    const { data: drivers, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });

    const { role } = await getUserProfile();

    return (
        <DriversClient
            drivers={(drivers ?? []) as any}
            error={error ? error.message : undefined}
            userRole={role}
        />
    );
}
