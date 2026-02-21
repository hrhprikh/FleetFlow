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
import { Search, AlertTriangle } from "lucide-react";
import { STATUS_COLORS, DRIVER_STATUS } from "@/lib/constants";
import type { Driver } from "@/lib/types";
import type { UserRole } from "@/lib/auth";
import { DriverFormDialog } from "./driver-form-dialog";

interface DriversClientProps {
    drivers: Driver[];
    error?: string;
    userRole: UserRole;
}

export function DriversClient({ drivers, error, userRole }: DriversClientProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const now = new Date();
    const isExpired = (date: string) => new Date(date) < now;
    const isExpiringSoon = (date: string) => {
        const expiry = new Date(date);
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expiry >= now && expiry <= thirtyDays;
    };

    const filtered = useMemo(() => {
        let result = drivers;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (d) =>
                    d.name.toLowerCase().includes(q) ||
                    d.license_no.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((d) => d.status === statusFilter);
        }
        return result;
    }, [drivers, search, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Driver Management</h2>
                    <p className="text-sm text-gray-500">Driver profiles, license compliance & safety scores</p>
                </div>
                <DriverFormDialog userRole={userRole} />
            </div>

            {/* Filters */}
            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or license..."
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
                                {Object.values(DRIVER_STATUS).map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
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
                                <TableHead>Name</TableHead>
                                <TableHead>License No</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>License Expiry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Safety Score</TableHead>
                                <TableHead className="text-right">Trips</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {error ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                                        Failed to load drivers. Make sure the database is set up.
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                                        {drivers.length === 0
                                            ? "No drivers found. Add your first driver to get started."
                                            : "No drivers match your filters."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((driver) => (
                                    <TableRow key={driver.id}>
                                        <TableCell className="font-medium">{driver.name}</TableCell>
                                        <TableCell className="font-mono">{driver.license_no}</TableCell>
                                        <TableCell>{driver.license_category}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={
                                                        isExpired(driver.license_expiry)
                                                            ? "text-red-500"
                                                            : isExpiringSoon(driver.license_expiry)
                                                                ? "text-amber-500"
                                                                : ""
                                                    }
                                                >
                                                    {new Date(driver.license_expiry).toLocaleDateString()}
                                                </span>
                                                {isExpired(driver.license_expiry) && (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                        EXPIRED
                                                    </Badge>
                                                )}
                                                {isExpiringSoon(driver.license_expiry) && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={STATUS_COLORS[driver.status] || ""}>
                                                {driver.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={
                                                    driver.safety_score >= 80
                                                        ? "text-emerald-500"
                                                        : driver.safety_score >= 60
                                                            ? "text-amber-500"
                                                            : "text-red-500"
                                                }
                                            >
                                                {driver.safety_score}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {driver.completed_trips}/{driver.trip_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DriverFormDialog userRole={userRole} driver={driver} />
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
