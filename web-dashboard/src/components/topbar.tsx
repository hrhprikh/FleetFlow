"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { UserRole } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Truck,
    Users,
    Route,
    Wrench,
    Fuel,
    BarChart3,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    Truck,
    Users,
    Route,
    Wrench,
    Fuel,
    BarChart3,
};

interface TopbarProps {
    userRole?: UserRole;
    userName?: string;
    userEmail?: string;
}

export function Topbar({ userRole, userName, userEmail }: TopbarProps) {
    const pathname = usePathname();

    // Get current page title
    const currentPage =
        NAV_ITEMS.find(
            (item) =>
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
        ) || NAV_ITEMS[0];

    // Filter nav items based on user role for mobile menu
    const filteredNavItems = NAV_ITEMS.filter(item => {
        if (!item.allowedRoles) return true;
        if (!userRole) return false;
        return item.allowedRoles.includes(userRole);
    });

    const initials = userName
        ? userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "U";

    return (
        <header className="flex items-center gap-4 h-16 border-b border-gray-200 bg-white px-4 md:px-6">
            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm">
                            FF
                        </div>
                        <span className="font-bold text-base text-gray-900">FleetFlow</span>
                    </div>
                    <nav className="py-4 px-2 space-y-0.5">
                        {filteredNavItems.map((item) => {
                            const Icon = iconMap[item.icon];
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <SheetClose asChild key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative",
                                            isActive
                                                ? "bg-slate-100 text-indigo-600 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-indigo-600 before:rounded-full"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        {Icon && <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-indigo-600" : "text-gray-400")} />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SheetClose>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Page Title */}
            <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">{currentPage.title}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">
                    {currentPage.description}
                </p>
            </div>

            {/* User Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9 border border-indigo-200">
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-medium text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{userName || "User"}</p>
                            <p className="text-xs text-gray-400">
                                {userRole || "No Role"} &bull; {userEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={async (e) => {
                        e.preventDefault();
                        await logout();
                    }}>
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
