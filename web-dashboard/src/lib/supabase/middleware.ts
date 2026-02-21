import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { allowedRolesMap } from "@/lib/rbac";
import type { AppRole } from "@/lib/types";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Public routes — pass through
    if (path.startsWith("/_next") || path.startsWith("/favicon.ico") || path.startsWith("/auth/callback")) {
        return supabaseResponse;
    }

    // API routes — pass through (auth handled per-route or via RLS)
    if (path.startsWith("/api/")) {
        return supabaseResponse;
    }

    // Root redirect
    if (path === "/") {
        const url = request.nextUrl.clone();
        url.pathname = user ? "/dashboard" : "/login";
        return NextResponse.redirect(url);
    }

    // Logged-in users on login page → dashboard
    if (path.startsWith("/login") && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Protect dashboard routes — require auth
    if (path.startsWith("/dashboard") && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // RBAC: block unauthorized role access to sub-resources
    if (path.startsWith("/dashboard") && user) {
        const pathParts = path.split("/");
        const resource = pathParts.length > 2 ? pathParts[2] : "";

        if (resource && allowedRolesMap[resource]) {
            // Fetch role from profiles → roles
            const { data: profile } = await supabase
                .from("profiles")
                .select(`roles(name)`)
                .eq("id", user.id)
                .single();

            const roleData = profile?.roles as unknown as { name: string } | null;
            const roleName = roleData?.name as AppRole | undefined;

            if (!roleName || !allowedRolesMap[resource].includes(roleName)) {
                const url = request.nextUrl.clone();
                url.pathname = "/dashboard";
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse;
}
