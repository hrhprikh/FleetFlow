"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Pencil } from "lucide-react";
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
import { VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import type { UserRole } from "@/lib/auth";
import { createVehicle, updateVehicle } from "@/app/actions";

const formSchema = z.object({
    plate: z.string().min(2, "Plate is required").max(15),
    model: z.string().min(2, "Model is required"),
    type: z.string().min(1, "Type is required"),
    max_capacity: z.coerce.number().min(0, "Capacity must be positive"),
    odometer: z.coerce.number().min(0, "Odometer cannot be negative"),
    acquisition_cost: z.coerce.number().min(0).optional(),
});

type VehicleFormValues = z.infer<typeof formSchema>;

interface VehicleFormDialogProps {
    userRole: UserRole;
    vehicle?: Vehicle;
}

export function VehicleFormDialog({ userRole, vehicle }: VehicleFormDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isEdit = !!vehicle;
    const canCreate = hasPermission(userRole, "create:vehicles");
    const canEdit = hasPermission(userRole, "edit:vehicles");

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            plate: vehicle?.plate ?? "",
            model: vehicle?.model ?? "",
            type: vehicle?.type ?? "",
            max_capacity: vehicle?.max_capacity ?? 0,
            odometer: vehicle?.odometer ?? 0,
            acquisition_cost: vehicle?.acquisition_cost ?? 0,
        },
    });

    useEffect(() => {
        if (vehicle) {
            form.reset({
                plate: vehicle.plate,
                model: vehicle.model,
                type: vehicle.type,
                max_capacity: vehicle.max_capacity,
                odometer: vehicle.odometer,
                acquisition_cost: vehicle.acquisition_cost ?? 0,
            });
        }
    }, [vehicle, form]);

    async function onSubmit(values: VehicleFormValues) {
        setIsLoading(true);
        try {
            const fd = new FormData();
            Object.entries(values).forEach(([key, val]) => {
                if (val !== undefined && val !== null) fd.set(key, String(val));
            });

            if (isEdit) {
                fd.set("vehicle_id", vehicle!.id);
                await updateVehicle(fd);
                toast.success("Vehicle updated");
            } else {
                await createVehicle(fd);
                toast.success("Vehicle added");
            }

            form.reset();
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isEdit && !canEdit) return null;
    if (!isEdit && !canCreate) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm">
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                    </Button>
                ) : (
                    <Button className="gap-2 w-fit">
                        <Plus className="h-4 w-4" />
                        Add Vehicle
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update vehicle details." : "Register a new vehicle in your fleet."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="plate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>License Plate</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ABC-1234" {...field} disabled={isEdit} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ford Transit" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {VEHICLE_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
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
                                name="max_capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="odometer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Odometer (km)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="acquisition_cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Acquisition Cost (₹)</FormLabel>
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
                                {isLoading ? "Saving..." : isEdit ? "Update Vehicle" : "Save Vehicle"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
