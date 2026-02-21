"use client";

import { useState } from "react";
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
import { LICENSE_CATEGORIES } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions";
import { createDriver, updateDriver } from "@/app/actions";
import type { Driver } from "@/lib/types";
import type { UserRole } from "@/lib/auth";

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    license_no: z.string().min(2, "License number is required"),
    license_expiry: z.string().min(1, "Expiry date is required"),
    license_category: z.string().min(1, "Category is required"),
    safety_score: z.coerce.number().min(0).max(100).default(100),
});

type DriverFormValues = z.infer<typeof formSchema>;

interface DriverFormDialogProps {
    userRole: UserRole;
    driver?: Driver;
}

export function DriverFormDialog({ userRole, driver }: DriverFormDialogProps) {
    const isEdit = !!driver;
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // RBAC gate
    if (isEdit && !hasPermission(userRole, "edit:drivers")) return null;
    if (!isEdit && !hasPermission(userRole, "create:drivers")) return null;

    const form = useForm<DriverFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: driver?.name ?? "",
            license_no: driver?.license_no ?? "",
            license_expiry: driver?.license_expiry ?? "",
            license_category: driver?.license_category ?? LICENSE_CATEGORIES[0],
            safety_score: driver?.safety_score ?? 100,
        },
    });

    async function onSubmit(values: DriverFormValues) {
        setIsLoading(true);
        try {
            const fd = new FormData();
            if (isEdit) fd.append("driver_id", driver!.id);
            Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));

            if (isEdit) {
                await updateDriver(fd);
                toast.success("Driver updated successfully");
            } else {
                await createDriver(fd);
                toast.success("Driver added successfully");
            }
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
                {isEdit ? (
                    <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                ) : (
                    <Button className="gap-2 w-fit"><Plus className="h-4 w-4" />Add Driver</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update driver details and license information." : "Register a new driver profile with their license details."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="license_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>License Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CDL-123456" disabled={isEdit} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="license_expiry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="license_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {LICENSE_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="safety_score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Safety Score (0–100)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} max={100} {...field} />
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
                                {isLoading ? "Saving..." : isEdit ? "Update Driver" : "Save Driver"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
