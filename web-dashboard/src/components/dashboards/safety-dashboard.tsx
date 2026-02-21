import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Wrench,
    AlertTriangle,
    ShieldCheck,
    Truck,
} from "lucide-react";
import Link from "next/link";

export function SafetyDashboard({ kpis }: { kpis: any }) {
    const kpiCards = [
        {
            title: "Vehicles in Shop",
            value: kpis?.in_maintenance ?? "—",
            subtitle: "Currently under repair",
            icon: Wrench,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "Open Work Orders",
            value: kpis?.open_maintenance ?? "—",
            subtitle: "Pending or active jobs",
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Total Fleet",
            value: kpis?.total_vehicles ?? "—",
            subtitle: "Vehicles to monitor",
            icon: Truck,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card
                            key={kpi.title}
                            className="border-gray-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {kpi.title}
                                </CardTitle>
                                <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-[28px] font-bold tracking-tight text-gray-900">
                                    {kpi.value}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-400">
                                        {kpi.subtitle}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-base text-gray-900">Safety & Compliance Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/dashboard/maintenance">
                        <Button className="gap-2">
                            <Wrench className="h-4 w-4" />
                            Log Maintenance Problem
                        </Button>
                    </Link>
                    <Link href="/dashboard/maintenance">
                        <Button variant="outline" className="gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            View Open Logs
                        </Button>
                    </Link>
                    <Button variant="outline" className="gap-2 opacity-50 cursor-not-allowed">
                        <ShieldCheck className="h-4 w-4" />
                        Log Inspection (Comming Soon)
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-base text-amber-700 font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Critical Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(kpis?.in_maintenance ?? 0) > 0 ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <h3 className="font-semibold text-amber-700">Action Required</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    You have {kpis.in_maintenance} vehicle(s) currently marked as "In Shop". Please ensure work orders are progressing.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 text-gray-500">
                            <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                            <p>All clear! No critical alerts.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
