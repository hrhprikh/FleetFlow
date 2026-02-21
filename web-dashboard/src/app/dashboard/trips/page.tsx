import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { STATUS_COLORS, TRIP_STATUS } from "@/lib/constants";
import type { Trip } from "@/lib/types";
import { TripFormDialog } from "@/components/trips/trip-form-dialog";
import { TripActionButtons } from "@/components/trips/trip-action-buttons";
import { getUserProfile } from "@/lib/auth";

export default async function TripsPage() {
    const supabase = await createClient();
    const { role } = await getUserProfile();

    const { data: trips, error } = await supabase
        .from("trips")
        .select("*, vehicle:vehicles(plate, model), driver:drivers(name)")
        .order("created_at", { ascending: false });

    // Fetch active trips to filter out busy vehicles and drivers
    const { data: activeTrips } = await supabase
        .from("trips")
        .select("vehicle_id, driver_id")
        .in("status", ["Draft", "Dispatched"]);

    const busyVehicleIds = new Set(activeTrips?.map((t: any) => t.vehicle_id) || []);
    const busyDriverIds = new Set(activeTrips?.map((t: any) => t.driver_id) || []);

    // Fetch available vehicles
    const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "Available")
        .order("plate");

    const availableVehicles = vehicles?.filter(v => !busyVehicleIds.has(v.id)) || [];

    // Fetch all drivers except suspended ones
    const { data: drivers } = await supabase
        .from("drivers")
        .select("*")
        .neq("status", "Suspended")
        .order("name");

    const availableDrivers = drivers?.filter(d => !busyDriverIds.has(d.id)) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trip Dispatcher</h2>
                    <p className="text-sm text-gray-500">
                        Create, dispatch, and manage trip lifecycle
                    </p>
                </div>
                <TripFormDialog vehicles={availableVehicles} drivers={availableDrivers} userRole={role} />
            </div>

            {/* Filters */}
            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by origin, destination..."
                                className="pl-9"
                            />
                        </div>
                        <Select>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.values(TRIP_STATUS).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-gray-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead className="text-right">Cargo (kg)</TableHead>
                                <TableHead>Scheduled</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {error || !trips || trips.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center text-gray-400"
                                    >
                                        {error
                                            ? "Failed to load trips. Make sure the database is set up."
                                            : "No trips found. Create your first trip to get started."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                trips.map((trip: Trip) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <div>
                                                <span className="font-mono font-medium text-xs">
                                                    {trip.vehicle?.plate ?? "—"}
                                                </span>
                                                <p className="text-xs text-gray-400">
                                                    {trip.vehicle?.model ?? ""}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{trip.driver?.name ?? "—"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <span className="truncate max-w-[80px]">
                                                    {trip.origin}
                                                </span>
                                                <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                                                <span className="truncate max-w-[80px]">
                                                    {trip.destination}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {trip.cargo_weight.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {trip.scheduled_date
                                                ? `${new Date(trip.scheduled_date).toLocaleDateString()}${trip.scheduled_time ? ` ${trip.scheduled_time.slice(0, 5)}` : ""}`
                                                : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={STATUS_COLORS[trip.status] || ""}
                                            >
                                                {trip.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(trip.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TripActionButtons tripId={trip.id} status={trip.status} userRole={role} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
