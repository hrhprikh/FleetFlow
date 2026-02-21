import { createClient } from "@/lib/supabase/server";

/**
 * Write an entry to the audit_logs table.
 * Fire-and-forget — errors are logged to console but never propagate.
 */
export async function logAudit(
    supabase: Awaited<ReturnType<typeof createClient>>,
    entityName: string,
    action: string,
    entityId?: string,
    beforeData?: Record<string, unknown>,
    afterData?: Record<string, unknown>
) {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { error } = await supabase.from("audit_logs").insert({
            actor_id: user?.id ?? null,
            entity_name: entityName,
            entity_id: entityId ?? null,
            action,
            before_data: beforeData ?? null,
            after_data: afterData ?? null,
        });

        if (error) {
            console.error("[Audit] Insert failed:", error.message, { entityName, action, entityId });
        }
    } catch (err) {
        console.error("[Audit] Operation failed:", { entityName, action, entityId, err });
    }
}
