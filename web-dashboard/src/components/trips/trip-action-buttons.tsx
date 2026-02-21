"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";
import { dispatchTrip, cancelTrip } from "@/app/actions";
import { CompleteTripDialog } from "./complete-trip-dialog";
import type { UserRole } from "@/lib/auth";

interface TripActionButtonsProps {
    tripId: string;
    status: string;
    userRole: UserRole;
}

export function TripActionButtons({ tripId, status, userRole }: TripActionButtonsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const canDispatch = hasPermission(userRole, "dispatch_trip");
    const canComplete = hasPermission(userRole, "complete_trip");
    const canCancel = hasPermission(userRole, "cancel_trip");

    if (!canDispatch && !canComplete && !canCancel) return <div className="min-w-[60px]" />;

    async function handleAction(action: "dispatch" | "cancel") {
        setIsLoading(true);
        try {
            const fd = new FormData();
            fd.append("trip_id", tripId);
            if (action === "dispatch") {
                await dispatchTrip(fd);
                toast.success("Trip dispatched successfully");
            } else {
                await cancelTrip(fd);
                toast.success("Trip cancelled successfully");
            }
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : `Failed to ${action} trip`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-end gap-1">
            {status === "Draft" && canDispatch && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("dispatch")}
                    disabled={isLoading}
                    className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                >
                    Dispatch
                </Button>
            )}
            {status === "Dispatched" && canComplete && (
                <CompleteTripDialog tripId={tripId} disabled={isLoading} />
            )}
            {(status === "Draft" || status === "Dispatched") && canCancel && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction("cancel")}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                    Cancel
                </Button>
            )}
        </div>
    );
}
