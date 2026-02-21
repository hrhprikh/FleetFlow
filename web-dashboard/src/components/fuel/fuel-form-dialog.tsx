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
import { EXPENSE_TYPES, EXPENSE_TYPE_LABELS } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions";
import { createFuelLog } from "@/app/actions";
import type { Vehicle } from "@/lib/types";
import type { UserRole } from "@/lib/auth";

const formSchema = z.object({
    vehicle_id: z.string().uuid("Please select a vehicle"),
    expense_type: z.enum(["fuel", "toll", "repair", "other"]).default("fuel"),
    liters: z.coerce.number().min(0).optional(),
    cost: z.coerce.number().min(0.01, "Cost must be greater than 0"),
    notes: z.string().optional(),
    date: z.string().min(1, "Date is required"),
});

type FuelFormValues = z.infer<typeof formSchema>;

interface FuelFormDialogProps {
    vehicles: Vehicle[];
    userRole: UserRole;
}

export function FuelFormDialog({ vehicles, userRole }: FuelFormDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!hasPermission(userRole, "create:fuel")) return null;

    const form = useForm<FuelFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            vehicle_id: "",
            expense_type: "fuel",
            liters: 0,
            cost: 0,
            notes: "",
            date: new Date().toISOString().split("T")[0],
        },
    });

    const expenseType = form.watch("expense_type");

    async function onSubmit(values: FuelFormValues) {
        setIsLoading(true);
        try {
            const fd = new FormData();
            fd.append("vehicle_id", values.vehicle_id);
            fd.append("expense_type", values.expense_type);
            fd.append("cost", String(values.cost));
            fd.append("date", values.date);
            if (values.liters && values.liters > 0) fd.append("liters", String(values.liters));
            if (values.notes) fd.append("notes", values.notes);

            await createFuelLog(fd);
            toast.success("Expense logged successfully");
            form.reset({ vehicle_id: "", expense_type: "fuel", liters: 0, cost: 0, notes: "", date: new Date().toISOString().split("T")[0] });
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
                    Log Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Expense Entry</DialogTitle>
                    <DialogDescription>
                        Record fuel, toll, repair, or other costs for a vehicle.
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
                                                <SelectItem value="empty" disabled>No vehicles found</SelectItem>
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
                            name="expense_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expense Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {EXPENSE_TYPES.map((t) => (
                                                <SelectItem key={t} value={t}>{EXPENSE_TYPE_LABELS[t]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {expenseType === "fuel" && (
                                <FormField
                                    control={form.control}
                                    name="liters"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Volume (Liters)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem className={expenseType !== "fuel" ? "col-span-2" : ""}>
                                        <FormLabel>Total Cost (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Toll gate, fuel station, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
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
                                {isLoading ? "Saving..." : "Save Log"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
