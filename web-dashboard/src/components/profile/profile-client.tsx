"use client";

import { useState, useTransition } from "react";
import { updateProfile, changePassword } from "@/app/dashboard/profile/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    User,
    Mail,
    Shield,
    Calendar,
    Clock,
    Lock,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
} from "lucide-react";
import type { AppRole } from "@/lib/types";

interface ProfileData {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    last_sign_in: string | null;
    email_confirmed: boolean;
}

interface ProfileClientProps {
    profile: ProfileData;
}

// Role-specific descriptions and colors
const ROLE_INFO: Record<string, { description: string; color: string; permissions: string[] }> = {
    Manager: {
        description: "Full administrative access to all fleet operations.",
        color: "bg-[#F3E8FF] text-[#7C3AED] border-[#F3E8FF]",
        permissions: [
            "Manage vehicles, drivers, trips",
            "Create & close maintenance logs",
            "Manage fuel & expenses",
            "View analytics & reports",
            "Export data (CSV/PDF)",
            "Delete records",
        ],
    },
    Dispatcher: {
        description: "Operations-focused role for trip management and dispatch.",
        color: "bg-[#DBEAFE] text-[#1D4ED8] border-[#DBEAFE]",
        permissions: [
            "View vehicles & drivers",
            "Create & manage trips",
            "Dispatch, complete, cancel trips",
            "View maintenance logs",
        ],
    },
    "Safety Officer": {
        description: "Compliance and safety monitoring for drivers and vehicles.",
        color: "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",
        permissions: [
            "View drivers & trips",
            "Create & manage maintenance logs",
            "Edit driver profiles & status",
            "Suspend drivers",
        ],
    },
    "Financial Analyst": {
        description: "Financial oversight for fleet costs, revenue, and reporting.",
        color: "bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]",
        permissions: [
            "View vehicles & maintenance costs",
            "Create & manage fuel/expense logs",
            "View analytics & insights",
            "Export financial reports",
        ],
    },
};

export function ProfileClient({ profile }: ProfileClientProps) {
    const [isPending, startTransition] = useTransition();
    const [isPasswordPending, startPasswordTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const roleInfo = ROLE_INFO[profile.role] || ROLE_INFO.Dispatcher;

    const initials = profile.full_name
        ? profile.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "U";

    const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const lastSignIn = profile.last_sign_in
        ? new Date(profile.last_sign_in).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "Never";

    function handleProfileSubmit(formData: FormData) {
        setMessage(null);
        startTransition(async () => {
            const result = await updateProfile(formData);
            if (result?.error) {
                setMessage({ type: "error", text: result.error });
            } else if (result?.success) {
                setMessage({ type: "success", text: result.success });
            }
        });
    }

    function handlePasswordSubmit(formData: FormData) {
        setPasswordMessage(null);
        startPasswordTransition(async () => {
            const result = await changePassword(formData);
            if (result?.error) {
                setPasswordMessage({ type: "error", text: result.error });
            } else if (result?.success) {
                setPasswordMessage({ type: "success", text: result.success });
                // Reset the form
                const form = document.getElementById("password-form") as HTMLFormElement;
                form?.reset();
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Profile Overview Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-20 w-20 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-semibold">{profile.full_name || "Unnamed User"}</h2>
                                <Badge variant="outline" className={roleInfo.color}>
                                    {profile.role}
                                </Badge>
                                {profile.email_confirmed && (
                                    <Badge variant="outline" className="bg-[#DCFCE7] text-[#166534] border-[#DCFCE7]">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{roleInfo.description}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {profile.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Member since {memberSince}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Last login: {lastSignIn}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>
                        Update your name. Email and role changes require admin action.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleProfileSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    defaultValue={profile.full_name}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-gray-100"
                                />
                                <p className="text-xs text-gray-400">
                                    Contact your manager to change email
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    value={profile.role}
                                    disabled
                                    className="bg-gray-100"
                                />
                                <p className="text-xs text-gray-400">
                                    Role is assigned by a Manager
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>User ID</Label>
                                <Input
                                    value={profile.id}
                                    disabled
                                    className="bg-gray-100 font-mono text-xs"
                                />
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                                    message.type === "success"
                                        ? "bg-emerald-500/15 text-emerald-600"
                                        : "bg-red-500/15 text-red-600"
                                }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                )}
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving…" : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password. Must be at least 6 characters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="password-form" action={handlePasswordSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new_password"
                                        name="new_password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        required
                                        minLength={6}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {passwordMessage && (
                            <div
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                                    passwordMessage.type === "success"
                                        ? "bg-[#DCFCE7] text-emerald-600"
                                        : "bg-[#FEE2E2] text-red-600"
                                }`}
                            >
                                {passwordMessage.type === "success" ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                )}
                                {passwordMessage.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" variant="outline" disabled={isPasswordPending}>
                                {isPasswordPending ? "Changing…" : "Change Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5" />
                        Role &amp; Permissions
                    </CardTitle>
                    <CardDescription>
                        Your current role determines what you can access in FleetFlow.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`text-sm px-3 py-1 ${roleInfo.color}`}>
                                {profile.role}
                            </Badge>
                            <span className="text-sm text-gray-500">{roleInfo.description}</span>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium mb-3">What you can do:</h4>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {roleInfo.permissions.map((perm) => (
                                    <li key={perm} className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                        {perm}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
