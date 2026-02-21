"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";
import { closeMaintenance } from "@/app/actions";
import type { UserRole } from "@/lib/auth";

interface MaintenanceActionButtonsProps {
    logId: string;
    userRole: UserRole;
}

export function MaintenanceActionButtons({ logId, userRole }: MaintenanceActionButtonsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!hasPermission(userRole, "edit:maintenance")) return null;

    async function handleClose() {
        setIsLoading(true);
        try {
            const fd = new FormData();
            fd.append("maintenance_id", logId);
            await closeMaintenance(fd);
            toast.success("Maintenance job closed successfully");
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to close maintenance log");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
        >
            {isLoading ? "Closing..." : "Close Job"}
        </Button>
    );
}
