import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
    const { user, profile, role } = await getUserProfile();

    if (!user || !profile) {
        redirect("/login");
    }

    // Fetch the auth user metadata for additional context
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    const profileData = {
        id: user.id,
        full_name: profile.full_name || "",
        email: authUser?.email || "",
        role: role || "Dispatcher",
        created_at: profile.created_at,
        last_sign_in: authUser?.last_sign_in_at || null,
        email_confirmed: !!authUser?.email_confirmed_at,
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
                <p className="text-gray-500">
                    Manage your personal information and account settings
                </p>
            </div>
            <ProfileClient profile={profileData} />
        </div>
    );
}
