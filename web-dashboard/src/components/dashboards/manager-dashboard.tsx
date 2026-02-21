import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Truck,
    Wrench,
    TrendingUp,
    Package,
    Plus,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

export function ManagerDashboard({ kpis }: { kpis: any }) {
    const kpiCards = [
        {
            title: "Active Fleet",
            value: kpis?.active_fleet ?? "—",
            subtitle: `${kpis?.total_vehicles ?? 0} total vehicles`,
            icon: Truck,
            trend: "up" as const,
            trendValue: "+2 today",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "In Maintenance",
            value: kpis?.in_maintenance ?? "—",
            subtitle: `${kpis?.open_maintenance ?? 0} open jobs`,
            icon: Wrench,
            trend: "down" as const,
            trendValue: "-1 today",
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "Utilization Rate",
            value: kpis ? `${kpis.utilization_rate}%` : "—",
            subtitle: `${kpis?.available_vehicles ?? 0} available`,
            icon: TrendingUp,
            trend: "up" as const,
            trendValue: "+5%",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Pending Trips",
            value: kpis?.pending_trips ?? "—",
            subtitle: `${kpis?.completed_trips ?? 0} completed`,
            icon: Package,
            trend: "neutral" as const,
            trendValue: "3 drafts",
            color: "text-violet-600",
            bgColor: "bg-violet-50",
        },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.title} className="border-gray-200">
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
                                    {kpi.trend === "up" && (
                                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                                    )}
                                    {kpi.trend === "down" && (
                                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {kpi.subtitle}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-base text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/dashboard/trips">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Trip
                        </Button>
                    </Link>
                    <Link href="/dashboard/vehicles">
                        <Button variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Vehicles
                        </Button>
                    </Link>
                    <Link href="/dashboard/maintenance">
                        <Button variant="outline" className="gap-2">
                            <Wrench className="h-4 w-4" />
                            Add Maintenance
                        </Button>
                    </Link>
                    <Link href="/dashboard/analytics">
                        <Button variant="outline" className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            View Analytics
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Recent Activity & Fleet Status */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Fleet Status */}
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900">Fleet Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {
                                label: "Available",
                                count: kpis?.available_vehicles ?? 0,
                                total: kpis?.total_vehicles ?? 1,
                                color: "bg-emerald-500",
                            },
                            {
                                label: "On Trip",
                                count: kpis?.active_fleet ?? 0,
                                total: kpis?.total_vehicles ?? 1,
                                color: "bg-blue-500",
                            },
                            {
                                label: "In Shop",
                                count: kpis?.in_maintenance ?? 0,
                                total: kpis?.total_vehicles ?? 1,
                                color: "bg-amber-500",
                            },
                        ].map((status) => (
                            <div key={status.label} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">{status.label}</span>
                                    <span className="font-medium text-gray-900">
                                        {status.count}/{kpis?.total_vehicles ?? 0}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${status.color} transition-all`}
                                        style={{
                                            width: `${status.total > 0
                                                ? (status.count / status.total) * 100
                                                : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Driver Status */}
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900">Driver Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl bg-gray-50 p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {kpis?.on_duty_drivers ?? 0}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    On Duty
                                </div>
                                <Badge
                                    variant="outline"
                                    className="mt-2 bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]"
                                >
                                    Active
                                </Badge>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {kpis?.total_drivers ?? 0}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Total Drivers
                                </div>
                                <Badge
                                    variant="outline"
                                    className="mt-2 bg-[#DBEAFE] text-[#1D4ED8] border-[#DBEAFE]"
                                >
                                    Registered
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
