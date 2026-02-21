import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth";
import { toCsv, toSimplePdf } from "@/lib/exports";

/**
 * GET /api/exports/financial?format=csv|pdf
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

        const [{ data: trips }, { data: fuel }, { data: maintenance }] = await Promise.all([
            supabase.from("trips").select("revenue, status, created_at"),
            supabase.from("fuel_logs").select("cost, expense_type, date"),
            supabase.from("maintenance_logs").select("cost, created_at"),
        ]);

        const totalRevenue = (trips ?? []).reduce((s, t) => s + Number(t.revenue ?? 0), 0);
        const totalFuel = (fuel ?? []).reduce((s, f) => s + Number(f.cost ?? 0), 0);
        const totalMaintenance = (maintenance ?? []).reduce((s, m) => s + Number(m.cost ?? 0), 0);
        const netProfit = totalRevenue - (totalFuel + totalMaintenance);

        const rows = [
            { metric: "Total Revenue", value: totalRevenue },
            { metric: "Fuel & Misc Expenses", value: totalFuel },
            { metric: "Maintenance Cost", value: totalMaintenance },
            { metric: "Net Profit", value: netProfit },
        ];

        if (format === "pdf") {
            const pdf = toSimplePdf(
                "FleetFlow Financial Summary",
                rows.map((r) => `${r.metric}: ${r.value}`)
            );
            return new Response(pdf as unknown as BodyInit, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": 'attachment; filename="financial-summary.pdf"',
                },
            });
        }

        const csv = toCsv(rows);
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="financial-summary.csv"',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
