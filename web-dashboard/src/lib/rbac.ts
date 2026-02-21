import type { AppRole } from "@/lib/types";

// ── Route-level access control ────────────────────────────────

export const roleRoutes: Record<AppRole, string[]> = {
    Manager: ["/dashboard", "/vehicles", "/trips", "/maintenance", "/fuel", "/drivers", "/analytics"],
    Dispatcher: ["/dashboard", "/vehicles", "/trips", "/drivers"],
    "Safety Officer": ["/dashboard", "/drivers", "/trips", "/maintenance"],
    "Financial Analyst": ["/dashboard", "/fuel", "/maintenance", "/analytics", "/vehicles"],
    Driver: ["/dashboard"],
};

/**
 * Check if a role can access a given pathname.
 */
export function canAccessRoute(role: AppRole, path: string): boolean {
    const routes = roleRoutes[role];
    if (!routes) return false;
    // /dashboard is always accessible, sub-routes need check
    if (path === "/dashboard") return true;
    return routes.some((route) => path.startsWith(`/dashboard${route.replace("/dashboard", "")}`));
}

// ── Action-level access control ───────────────────────────────

/**
 * Middleware-compatible route-to-roles map (for the old middleware pattern).
 * Maps the second path segment to which roles can access it.
 */
export const allowedRolesMap: Record<string, AppRole[]> = {
    vehicles: ["Manager", "Dispatcher", "Safety Officer", "Financial Analyst"],
    drivers: ["Manager", "Dispatcher", "Safety Officer"],
    trips: ["Manager", "Dispatcher", "Safety Officer"],
    maintenance: ["Manager", "Safety Officer", "Dispatcher", "Financial Analyst"],
    fuel: ["Manager", "Financial Analyst"],
    analytics: ["Manager", "Financial Analyst"],
};
