import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { getUserProfile } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch current user and profile server-side
    const { user, profile, role } = await getUserProfile();

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar userRole={role} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar
                    userRole={role}
                    userName={profile?.full_name || ""}
                    userEmail={user?.email || ""}
                />
                <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-5 md:p-6">{children}</main>
            </div>
        </div>
    );
}
