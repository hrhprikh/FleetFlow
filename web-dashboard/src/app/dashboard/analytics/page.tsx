import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, IndianRupee, Gauge } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ExportButtons } from "@/components/analytics/export-buttons";
import { SpendChart } from "@/components/analytics/spend-chart";

export default async function AnalyticsPage() {
    const supabase = await createClient();

    // Fetch data for analytics
    const [vehiclesRes, tripsRes, fuelRes, maintenanceRes] = await Promise.all([
        supabase.from("vehicles").select("*"),
        supabase.from("trips").select("*").eq("status", "Completed"),
        supabase.from("fuel_logs").select("*"),
        supabase.from("maintenance_logs").select("*"),
    ]);

    const vehicles = vehiclesRes.data || [];
    const trips = tripsRes.data || [];
    const fuelLogs = fuelRes.data || [];
    const maintenanceLogs = maintenanceRes.data || [];

    // Calculate fuel efficiency per vehicle
    const fuelEfficiency = vehicles.map((v) => {
        const vehicleTrips = trips.filter((t) => t.vehicle_id === v.id);
        const vehicleFuel = fuelLogs.filter((f) => f.vehicle_id === v.id);
        const totalDistance = vehicleTrips.reduce(
            (sum, t) => sum + ((t.end_odo || 0) - (t.start_odo || 0)),
            0
        );
        const totalLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
        const kmPerLiter = totalLiters > 0 ? totalDistance / totalLiters : 0;

        return {
            plate: v.plate,
            model: v.model,
            totalDistance,
            totalLiters,
            kmPerLiter: kmPerLiter.toFixed(2),
            fuelCost: vehicleFuel
                .reduce((sum, f) => sum + f.cost, 0)
                .toLocaleString("en-IN"),
        };
    });

    // Calculate ROI per vehicle
    const vehicleROI = vehicles.map((v) => {
        const vehicleTrips = trips.filter((t) => t.vehicle_id === v.id);
        const vehicleFuel = fuelLogs.filter((f) => f.vehicle_id === v.id);
        const vehicleMaint = maintenanceLogs.filter((m) => m.vehicle_id === v.id);

        const revenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
        const fuelCost = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
        const maintCost = vehicleMaint.reduce((sum, m) => sum + m.cost, 0);
        const roi =
            v.acquisition_cost > 0
                ? ((revenue - fuelCost - maintCost) / v.acquisition_cost) * 100
                : 0;

        return {
            plate: v.plate,
            model: v.model,
            revenue,
            fuelCost,
            maintCost,
            acquisitionCost: v.acquisition_cost,
            roi: roi.toFixed(1),
        };
    });

    // Summary KPIs
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);

    // Compute monthly spend data
    // Assuming data from the current year for simplicity.
    const currentYear = new Date().getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const spendData = months.map(m => ({ month: m, fuel: 0, maintenance: 0 }));

    fuelLogs.forEach(log => {
        const d = new Date(log.date || log.created_at);
        if (d.getFullYear() === currentYear) {
            spendData[d.getMonth()].fuel += log.cost;
        }
    });
    maintenanceLogs.forEach(log => {
        const d = new Date(log.created_at);
        if (d.getFullYear() === currentYear) {
            spendData[d.getMonth()].maintenance += log.cost;
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Analytics & Reports
                    </h2>
                    <p className="text-sm text-gray-500">
                        Fuel efficiency, vehicle ROI, and operational insights
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Revenue
                        </CardTitle>
                        <div className="rounded-lg p-2 bg-emerald-50">
                            <IndianRupee className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{totalRevenue.toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            From {trips.length} completed trips
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Fuel Cost
                        </CardTitle>
                        <div className="rounded-lg p-2 bg-blue-50">
                            <Gauge className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{totalFuelCost.toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {fuelLogs.length} fuel entries
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Maintenance
                        </CardTitle>
                        <div className="rounded-lg p-2 bg-amber-50">
                            <TrendingUp className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{totalMaintCost.toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {maintenanceLogs.length} service logs
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="fuel" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="fuel">Fuel Efficiency</TabsTrigger>
                    <TabsTrigger value="roi">Vehicle ROI</TabsTrigger>
                </TabsList>

                {/* Fuel Efficiency Tab */}
                <TabsContent value="fuel">
                    <Card className="border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-gray-900">
                                Fuel Efficiency by Vehicle
                            </CardTitle>
                            <ExportButtons data={fuelEfficiency} filename="fleetflow-fuel-efficiency" pdfTitle="Fuel Efficiency Report" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead className="text-right">Distance (km)</TableHead>
                                        <TableHead className="text-right">Fuel (L)</TableHead>
                                        <TableHead className="text-right">km/L</TableHead>
                                        <TableHead className="text-right">Fuel Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fuelEfficiency.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-32 text-center text-gray-400"
                                            >
                                                No data available. Complete trips and log fuel to see
                                                efficiency metrics.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fuelEfficiency.map((v) => (
                                            <TableRow key={v.plate}>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-mono font-medium text-xs">
                                                            {v.plate}
                                                        </span>
                                                        <p className="text-xs text-gray-400">
                                                            {v.model}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {v.totalDistance.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {v.totalLiters.toFixed(1)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            parseFloat(v.kmPerLiter) >= 8
                                                                ? "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]"
                                                                : parseFloat(v.kmPerLiter) >= 5
                                                                    ? "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]"
                                                                    : "bg-[#FEE2E2] text-[#991B1B] border-[#FEE2E2]"
                                                        }
                                                    >
                                                        {v.kmPerLiter}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ₹{v.fuelCost}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ROI Tab */}
                <TabsContent value="roi">
                    <Card className="border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-gray-900">Vehicle ROI Analysis</CardTitle>
                            <ExportButtons data={vehicleROI} filename="fleetflow-vehicle-roi" pdfTitle="Vehicle ROI Analysis" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Fuel Cost</TableHead>
                                        <TableHead className="text-right">Maint. Cost</TableHead>
                                        <TableHead className="text-right">Acq. Cost</TableHead>
                                        <TableHead className="text-right">ROI</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicleROI.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-32 text-center text-gray-400"
                                            >
                                                No data available. Add vehicles and complete trips to
                                                see ROI metrics.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vehicleROI.map((v) => (
                                            <TableRow key={v.plate}>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-mono font-medium text-xs">
                                                            {v.plate}
                                                        </span>
                                                        <p className="text-xs text-gray-400">
                                                            {v.model}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-emerald-600">
                                                    ₹{v.revenue.toLocaleString("en-IN")}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ₹{v.fuelCost.toLocaleString("en-IN")}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ₹{v.maintCost.toLocaleString("en-IN")}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-gray-400">
                                                    ₹{v.acquisitionCost.toLocaleString("en-IN")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            parseFloat(v.roi) > 0
                                                                ? "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]"
                                                                : "bg-[#FEE2E2] text-[#991B1B] border-[#FEE2E2]"
                                                        }
                                                    >
                                                        {v.roi}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Monthly Spend Chart */}
            <Card className="border-gray-200 mt-6">
                <CardHeader>
                    <CardTitle className="text-base text-gray-900">Monthly Operational Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <SpendChart data={spendData} />
                </CardContent>
            </Card>
        </div>
    );
}
