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
import { STATUS_COLORS, MAINTENANCE_STATUS } from "@/lib/constants";
import type { MaintenanceLog, Vehicle } from "@/lib/types";
import type { UserRole } from "@/lib/auth";
import { MaintenanceFormDialog } from "./maintenance-form-dialog";
import { MaintenanceActionButtons } from "./maintenance-action-buttons";

interface MaintenanceClientProps {
    logs: MaintenanceLog[];
    vehicles: Vehicle[];
    error?: string;
    userRole: UserRole;
}

export function MaintenanceClient({ logs, vehicles, error, userRole }: MaintenanceClientProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = useMemo(() => {
        let result = logs;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (l) =>
                    (l.vehicle?.plate ?? "").toLowerCase().includes(q) ||
                    (l.vehicle?.model ?? "").toLowerCase().includes(q) ||
                    l.service_type.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((l) => l.status === statusFilter);
        }
        return result;
    }, [logs, search, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Maintenance & Service Logs</h2>
                    <p className="text-sm text-gray-500">Track service history and manage vehicle maintenance</p>
                </div>
                <MaintenanceFormDialog vehicles={vehicles} userRole={userRole} />
            </div>

            {/* Filters */}
            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by vehicle or service type..."
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
                                {Object.values(MAINTENANCE_STATUS).map((s) => (
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
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Service Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {error ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                                        Failed to load maintenance logs. Make sure the database is set up.
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                                        {logs.length === 0
                                            ? "No maintenance logs found. Create your first service log."
                                            : "No logs match your filters."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div>
                                                <span className="font-mono font-medium text-xs">{log.vehicle?.plate ?? "—"}</span>
                                                <p className="text-xs text-gray-400">{log.vehicle?.model ?? ""}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{log.service_type}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-gray-500">{log.description}</TableCell>
                                        <TableCell className="text-right font-mono">₹{log.cost.toLocaleString("en-IN")}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={STATUS_COLORS[log.status] || ""}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {log.status === "Open" ? (
                                                <MaintenanceActionButtons logId={log.id} userRole={userRole} />
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Closed {log.closed_at ? new Date(log.closed_at).toLocaleDateString() : ""}
                                                </span>
                                            )}
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
