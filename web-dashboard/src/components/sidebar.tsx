"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { UserRole } from "@/lib/auth";
import {
    LayoutDashboard,
    Truck,
    Users,
    Route,
    Wrench,
    Fuel,
    BarChart3,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    Truck,
    Users,
    Route,
    Wrench,
    Fuel,
    BarChart3,
};

interface SidebarProps {
    userRole?: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    // Filter nav items based on user role
    const filteredNavItems = NAV_ITEMS.filter(item => {
        if (!item.allowedRoles) return true; // Allowed for everyone if not specified
        if (!userRole) return false; // If role required but user has no role, hide
        return item.allowedRoles.includes(userRole);
    });

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
                collapsed ? "w-[68px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shrink-0">
                    FF
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-base tracking-tight text-gray-900">FleetFlow</span>
                        <span className="text-[10px] text-gray-400 leading-none">
                            Fleet Management
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
                {filteredNavItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    const linkContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative",
                                isActive
                                    ? "bg-slate-100 text-indigo-600 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-indigo-600 before:rounded-full"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            {Icon && (
                                <Icon
                                    className={cn(
                                        "h-4.5 w-4.5 shrink-0",
                                        isActive ? "text-indigo-600" : "text-gray-400"
                                    )}
                                />
                            )}
                            {!collapsed && <span>{item.title}</span>}
                        </Link>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={item.href} delayDuration={0}>
                                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    {item.title}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return linkContent;
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="border-t border-gray-200 p-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            <span>Collapse</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
