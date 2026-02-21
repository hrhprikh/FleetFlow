import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    IndianRupee,
    PieChart,
    Plus
} from "lucide-react";
import Link from "next/link";

export function FinanceDashboard({ kpis }: { kpis: any }) {
    const kpiCards = [
        {
            title: "Fleet Utilization",
            value: kpis ? `${kpis.utilization_rate}%` : "—",
            subtitle: "Overall efficiency",
            icon: TrendingUp,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Total Vehicles",
            value: kpis?.total_vehicles ?? "—",
            subtitle: "Assets to track",
            icon: PieChart,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Completed Trips",
            value: kpis?.completed_trips ?? "—",
            subtitle: "Revenue generators",
            icon: IndianRupee,
            color: "text-green-600",
            bgColor: "bg-green-50",
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
                    <CardTitle className="text-base text-gray-900">Financial Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/dashboard/fuel">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Log Fuel Expenses
                        </Button>
                    </Link>
                    <Link href="/dashboard/analytics">
                        <Button variant="outline" className="gap-2">
                            <PieChart className="h-4 w-4" />
                            Full Analytics
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-12">
                <IndianRupee className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Advanced Financials Coming Soon</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">
                    Detailed expense tracking, revenue per mile metrics, and automated budget reports are scheduled for the next update.
                </p>
            </Card>
        </div>
    );
}
