import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth";
import { toCsv, toSimplePdf } from "@/lib/exports";

/**
 * GET /api/exports/vehicle-health?format=csv|pdf
 * Accessible by: Manager, Financial Analyst
 */
export async function GET(request: NextRequest) {
    try {
        const role = await getCurrentUserRole();
        if (role !== "Manager" && role !== "Financial Analyst") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const format = request.nextUrl.searchParams.get("format") ?? "csv";
        const supabase = await createClient();

        const [{ data: vehicles }, { data: maintenance }] = await Promise.all([
            supabase.from("vehicles").select("id, plate, status, odometer").eq("is_archived", false),
            supabase.from("maintenance_logs").select("vehicle_id, cost, closed_at"),
        ]);

        const rows = (vehicles ?? []).map((v) => {
            const related = (maintenance ?? []).filter((m) => m.vehicle_id === v.id);
            const openCount = related.filter((m) => !m.closed_at).length;
            const totalCost = related.reduce((s, m) => s + Number(m.cost ?? 0), 0);
            return {
                plate: v.plate,
                status: v.status,
                odometer: v.odometer,
                open_services: openCount,
                maintenance_cost: totalCost,
            };
        });

        if (format === "pdf") {
            const pdf = toSimplePdf(
                "FleetFlow Vehicle Health Audit",
                rows.map((r) => `${r.plate} | ${r.status} | open: ${r.open_services} | cost: ${r.maintenance_cost}`)
            );
            return new Response(pdf as unknown as BodyInit, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": 'attachment; filename="vehicle-health.pdf"',
                },
            });
        }

        const csv = toCsv(rows);
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="vehicle-health.csv"',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
