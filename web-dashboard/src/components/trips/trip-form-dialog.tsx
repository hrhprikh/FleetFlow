"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Vehicle, Driver } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import { UserRole } from "@/lib/auth";
import { createDraftTrip } from "@/app/actions";

const formSchema = z.object({
    vehicle_id: z.string().uuid("Please select a vehicle"),
    driver_id: z.string().uuid("Please select a driver"),
    origin: z.string().min(2, "Origin is required"),
    destination: z.string().min(2, "Destination is required"),
    cargo_weight: z.coerce.number().min(0, "Invalid weight"),
    revenue: z.coerce.number().min(0).optional(),
    scheduled_date: z.string().optional(),
    scheduled_time: z.string().optional(),
});

type TripFormValues = z.infer<typeof formSchema>;

interface TripFormDialogProps {
    vehicles: Vehicle[];
    drivers: Driver[];
    userRole: UserRole;
}

export function TripFormDialog({ vehicles, drivers, userRole }: TripFormDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Only allow managers and dispatchers to create trips
    const canCreateTrip = hasPermission(userRole, "create:trips");

    const form = useForm<TripFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            vehicle_id: "",
            driver_id: "",
            origin: "",
            destination: "",
            cargo_weight: 0,
            revenue: 0,
            scheduled_date: "",
            scheduled_time: "",
        },
    });

    async function onSubmit(values: TripFormValues) {
        setIsLoading(true);
        try {
            const selectedVehicle = vehicles.find((v) => v.id === values.vehicle_id);
            if (selectedVehicle && values.cargo_weight > selectedVehicle.max_capacity) {
                throw new Error(`Cargo weight (${values.cargo_weight}kg) exceeds vehicle capacity (${selectedVehicle.max_capacity}kg)`);
            }

            const fd = new FormData();
            fd.set("vehicle_id", values.vehicle_id);
            fd.set("driver_id", values.driver_id);
            fd.set("origin", values.origin);
            fd.set("destination", values.destination);
            fd.set("cargo_weight", String(values.cargo_weight));
            fd.set("revenue", String(values.revenue ?? 0));
            if (values.scheduled_date) fd.set("scheduled_date", values.scheduled_date);
            if (values.scheduled_time) fd.set("scheduled_time", values.scheduled_time);

            await createDraftTrip(fd);

            toast.success("Trip created in Draft status");
            form.reset();
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (!canCreateTrip) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 w-fit">
                    <Plus className="h-4 w-4" />
                    Create Trip
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Trip</DialogTitle>
                    <DialogDescription>
                        Draft a new trip. It will begin in Draft status until dispatched.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="vehicle_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle (Available Only)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vehicles.length === 0 && (
                                                <SelectItem value="empty" disabled>No vehicles available</SelectItem>
                                            )}
                                            {vehicles.map((v) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.plate} — {v.model} ({v.max_capacity}kg cap)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="driver_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Driver (On Duty Only)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select driver" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {drivers.length === 0 && (
                                                <SelectItem value="empty" disabled>No drivers available</SelectItem>
                                            )}
                                            {drivers.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name} ({d.license_category})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="origin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origin</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Warehouse A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Client Site B" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Scheduled Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="scheduled_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scheduled Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="scheduled_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scheduled Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cargo_weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="revenue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Est. Revenue (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Create Draft Trip"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
