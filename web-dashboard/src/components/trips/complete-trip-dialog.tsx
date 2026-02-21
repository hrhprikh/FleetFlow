"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { completeTrip } from "@/app/actions";

const schema = z.object({
    final_odo: z.coerce.number().positive("Final odometer must be positive"),
    revenue: z.coerce.number().min(0, "Revenue must be 0 or more"),
});

type FormValues = z.infer<typeof schema>;

interface CompleteTripDialogProps {
    tripId: string;
    disabled?: boolean;
}

export function CompleteTripDialog({ tripId, disabled }: CompleteTripDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: { final_odo: 0, revenue: 0 },
    });

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        try {
            const fd = new FormData();
            fd.append("trip_id", tripId);
            fd.append("final_odo", String(values.final_odo));
            fd.append("revenue", String(values.revenue));
            await completeTrip(fd);
            toast.success("Trip completed successfully");
            setOpen(false);
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to complete trip");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                    Complete
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[360px]">
                <DialogHeader>
                    <DialogTitle>Complete Trip</DialogTitle>
                    <DialogDescription>
                        Enter the final odometer reading and trip revenue to close this trip.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="final_odo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Final Odometer (km)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="125000" {...field} />
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
                                    <FormLabel>Revenue (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-2">
                            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Completing..." : "Complete Trip"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
