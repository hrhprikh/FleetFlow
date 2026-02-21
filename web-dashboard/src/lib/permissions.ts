import type { AppRole } from "./types";

// Define all possible resources in the application
export type Resource =
    | "dashboard"
    | "vehicles"
    | "drivers"
    | "trips"
    | "maintenance"
    | "fuel"
    | "analytics"
    | "settings";

// Generic actions applicable to most resources
export type Action = "view" | "create" | "edit" | "delete";

// Specific lifecycle actions
export type LifecycleAction =
    | "dispatch_trip"
    | "complete_trip"
    | "cancel_trip"
    | "retire_vehicle"
    | "reactivate_vehicle"
    | "suspend_driver";

export type Permission = `${Action}:${Resource}` | LifecycleAction;

// Define the permissions for each role
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
    Manager: [
        // Full access to everything essentially (We use specific perms to be explicit)
        "view:dashboard", "view:vehicles", "view:drivers", "view:trips", "view:maintenance", "view:fuel", "view:analytics", "view:settings",
        "create:vehicles", "create:drivers", "create:trips", "create:maintenance", "create:fuel",
        "edit:vehicles", "edit:drivers", "edit:trips", "edit:maintenance", "edit:fuel",
        "delete:vehicles", "delete:drivers", "delete:trips", "delete:maintenance", "delete:fuel",
        "dispatch_trip", "complete_trip", "cancel_trip", "retire_vehicle", "reactivate_vehicle", "suspend_driver",
    ],
    Dispatcher: [
        // Operations focused
        "view:dashboard", "view:vehicles", "view:drivers", "view:trips", "view:maintenance",
        "create:trips",
        "edit:trips",
        "dispatch_trip", "complete_trip", "cancel_trip",
    ],
    "Safety Officer": [
        // Compliance and Safety focused
        "view:dashboard", "view:drivers", "view:trips", "view:maintenance",
        "create:maintenance",
        "edit:drivers", "edit:maintenance",
        "suspend_driver",
    ],
    "Financial Analyst": [
        // Cost and Revenue focused
        "view:dashboard", "view:fuel", "view:maintenance", "view:analytics", "view:vehicles",
        "create:fuel",
        "edit:fuel"
    ],
    Driver: [
        // Mobile-only: limited read access
        "view:dashboard", "view:trips",
    ],
};

/**
 * Checks if a specific role has a given permission.
 */
export function hasPermission(role: AppRole | null, permission: Permission): boolean {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
}

/**
 * Checks if a role has access to view a specific root resource (for sidebar/routing).
 */
export function canViewResource(role: AppRole | null, resource: Resource): boolean {
    return hasPermission(role, `view:${resource}`);
}
