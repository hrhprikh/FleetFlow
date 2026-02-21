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
import { SERVICE_TYPES } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions";
import { createMaintenance } from "@/app/actions";
import type { Vehicle } from "@/lib/types";
import type { UserRole } from "@/lib/auth";

const formSchema = z.object({
    vehicle_id: z.string().uuid("Please select a vehicle"),
    service_type: z.string().min(1, "Service type is required"),
    description: z.string().optional().default(""),
    cost: z.coerce.number().min(0, "Cost must be positive"),
});

type MaintenanceFormValues = z.infer<typeof formSchema>;

interface MaintenanceFormDialogProps {
    vehicles: Vehicle[];
    userRole: UserRole;
}

export function MaintenanceFormDialog({ vehicles, userRole }: MaintenanceFormDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!hasPermission(userRole, "create:maintenance")) return null;

    const form = useForm<MaintenanceFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            vehicle_id: "",
            service_type: SERVICE_TYPES[0],
            description: "",
            cost: 0,
        },
    });

    async function onSubmit(values: MaintenanceFormValues) {
        setIsLoading(true);
        try {
            const fd = new FormData();
            Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? "")));
            await createMaintenance(fd);
            toast.success("Service log created. Vehicle moved to 'In Shop'.");
            form.reset();
            setOpen(false);
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 w-fit">
                    <Plus className="h-4 w-4" />
                    New Service Log
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Maintenance Log</DialogTitle>
                    <DialogDescription>
                        Record a service or repair. This auto-moves the vehicle to &quot;In Shop&quot;.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="vehicle_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vehicles.length === 0 && (
                                                <SelectItem value="empty" disabled>No available vehicles</SelectItem>
                                            )}
                                            {vehicles.map((v) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.plate} — {v.model}
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
                            name="service_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {SERVICE_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Replaced brake pads and rotors" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Cost (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Log & Update Vehicle"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
