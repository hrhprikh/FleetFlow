import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

export type UserRole = AppRole | null;

export async function getUserProfile() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, profile: null, role: null as UserRole };
    }

    // Fetch profile and role name via roles table
    const { data: profile } = await supabase
        .from("profiles")
        .select(`
      id,
      full_name,
      email,
      roles ( name )
    `)
        .eq("id", user.id)
        .single();

    const roleData = profile?.roles as unknown as { name: string } | null;
    const roleName = (roleData?.name ?? null) as UserRole;

    return {
        user,
        profile: profile as Profile | null,
        role: roleName,
    };
}

/**
 * Get just the role string for the current user.
 * Lightweight version for middleware / guards.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
    const { role } = await getUserProfile();
    return role;
}
