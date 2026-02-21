"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { STATUS_COLORS, VEHICLE_STATUS, VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/lib/types";
import type { UserRole } from "@/lib/auth";
import { VehicleFormDialog } from "./vehicle-form-dialog";

interface VehiclesClientProps {
    vehicles: Vehicle[];
    error?: string;
    userRole: UserRole;
}

export function VehiclesClient({ vehicles, error, userRole }: VehiclesClientProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const filtered = useMemo(() => {
        let result = vehicles;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (v) =>
                    v.plate.toLowerCase().includes(q) ||
                    v.model.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((v) => v.status === statusFilter);
        }
        if (typeFilter !== "all") {
            result = result.filter((v) => v.type === typeFilter);
        }
        return result;
    }, [vehicles, search, statusFilter, typeFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Vehicle Registry</h2>
                    <p className="text-sm text-gray-500">
                        Manage your fleet assets, statuses, and lifecycle
                    </p>
                </div>
                <VehicleFormDialog userRole={userRole} />
            </div>

            {/* Filters */}
            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by plate or model..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.values(VEHICLE_STATUS).map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {VEHICLE_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
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
                                <TableHead>Plate</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Capacity (kg)</TableHead>
                                <TableHead className="text-right">Odometer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {error ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                                        Failed to load vehicles. Make sure the database is set up.
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                                        {vehicles.length === 0
                                            ? "No vehicles found. Add your first vehicle to get started."
                                            : "No vehicles match your filters."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell className="font-mono font-medium">{vehicle.plate}</TableCell>
                                        <TableCell>{vehicle.model}</TableCell>
                                        <TableCell>{vehicle.type}</TableCell>
                                        <TableCell className="text-right">{vehicle.max_capacity.toLocaleString("en-IN")}</TableCell>
                                        <TableCell className="text-right font-mono">{vehicle.odometer.toLocaleString("en-IN")} km</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={STATUS_COLORS[vehicle.status] || ""}>
                                                {vehicle.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <VehicleFormDialog userRole={userRole} vehicle={vehicle} />
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
