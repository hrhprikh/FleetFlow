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
    Package,
    Plus,
    Eye,
    Map
} from "lucide-react";
import Link from "next/link";

export function DispatcherDashboard({ kpis }: { kpis: any }) {
    const kpiCards = [
        {
            title: "Pending Trips",
            value: kpis?.pending_trips ?? "—",
            subtitle: "Awaiting assignment",
            icon: Package,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Available Vehicles",
            value: kpis?.available_vehicles ?? "—",
            subtitle: "Ready for dispatch",
            icon: Truck,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Active On Trip",
            value: kpis?.active_fleet ?? "—",
            subtitle: "Currently en route",
            icon: Map,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
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

            {/* Quick Actions */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-base text-gray-900">Quick Dispatch Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/dashboard/trips">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Draft New Trip
                        </Button>
                    </Link>
                    <Link href="/dashboard/trips">
                        <Button variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View All Trips
                        </Button>
                    </Link>
                    <Link href="/dashboard/vehicles">
                        <Button variant="outline" className="gap-2">
                            <Truck className="h-4 w-4" />
                            Vehicle Availability
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Driver Status */}
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-base text-gray-900">Driver Availability</CardTitle>
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
                                    Ready
                                </Badge>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {(kpis?.total_drivers ?? 0) - (kpis?.on_duty_drivers ?? 0)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Off Duty / Unavailable
                                </div>
                                <Badge
                                    variant="outline"
                                    className="mt-2 text-gray-400"
                                >
                                    Unavailable
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Temporary placeholder for Map/Route View */}
                <Card className="border-gray-200 bg-gray-50/50 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <Map className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Live Tracking Map Integration Pending</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
