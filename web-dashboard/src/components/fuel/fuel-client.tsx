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
import { EXPENSE_TYPES, EXPENSE_TYPE_LABELS } from "@/lib/constants";
import type { FuelLog, Vehicle } from "@/lib/types";
import type { UserRole } from "@/lib/auth";
import { FuelFormDialog } from "./fuel-form-dialog";

interface FuelClientProps {
    fuelLogs: FuelLog[];
    vehicles: Vehicle[];
    error?: string;
    userRole: UserRole;
}

export function FuelClient({ fuelLogs, vehicles, error, userRole }: FuelClientProps) {
    const [search, setSearch] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const filtered = useMemo(() => {
        let result = fuelLogs;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (l) =>
                    (l.vehicle?.plate ?? "").toLowerCase().includes(q) ||
                    (l.vehicle?.model ?? "").toLowerCase().includes(q) ||
                    (l.notes ?? "").toLowerCase().includes(q)
            );
        }
        if (vehicleFilter !== "all") {
            result = result.filter((l) => l.vehicle_id === vehicleFilter);
        }
        if (typeFilter !== "all") {
            result = result.filter((l) => l.expense_type === typeFilter);
        }
        return result;
    }, [fuelLogs, search, vehicleFilter, typeFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Fuel & Expenses</h2>
                    <p className="text-sm text-gray-500">Track fuel consumption and operational costs</p>
                </div>
                <FuelFormDialog vehicles={vehicles} userRole={userRole} />
            </div>

            {/* Filters */}
            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by vehicle or notes..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Vehicles</SelectItem>
                                {vehicles.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>{v.plate}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {EXPENSE_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>{EXPENSE_TYPE_LABELS[t]}</SelectItem>
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
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Liters</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Rate (₹/L)</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                        Failed to load fuel logs. Make sure the database is set up.
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                        {fuelLogs.length === 0
                                            ? "No expense logs found. Log your first entry."
                                            : "No logs match your filters."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div>
                                                <span className="font-mono font-medium text-xs">
                                                    {log.vehicle?.plate ?? "—"}
                                                </span>
                                                <p className="text-xs text-gray-400">
                                                    {log.vehicle?.model ?? ""}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {EXPENSE_TYPE_LABELS[log.expense_type] ?? log.expense_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {log.liters ? log.liters.toFixed(1) : "—"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            ₹{log.cost.toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-gray-400">
                                            {log.liters ? `₹${(log.cost / log.liters).toFixed(2)}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(log.date).toLocaleDateString()}
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
