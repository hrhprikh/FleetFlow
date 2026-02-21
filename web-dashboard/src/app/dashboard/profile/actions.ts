"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth";
import { z } from "zod";

// ── Validation ────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
    full_name: z
        .string()
        .min(1, "Full name is required")
        .max(100, "Name is too long")
        .transform((s) => s.trim()),
});

const ChangePasswordSchema = z.object({
    new_password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});

// ── Update Profile ────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
    const { user } = await getUserProfile();
    if (!user) throw new Error("Not authenticated");

    const raw = {
        full_name: formData.get("full_name") as string,
    };

    const result = UpdateProfileSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const supabase = await createClient();

    // Update profiles table
    const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: result.data.full_name })
        .eq("id", user.id);

    if (profileError) {
        return { error: profileError.message };
    }

    // Also update auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: result.data.full_name },
    });

    if (authError) {
        return { error: authError.message };
    }

    revalidatePath("/dashboard", "layout");
    return { success: "Profile updated successfully" };
}

// ── Change Password ───────────────────────────────────────────

export async function changePassword(formData: FormData) {
    const { user } = await getUserProfile();
    if (!user) throw new Error("Not authenticated");

    const raw = {
        new_password: formData.get("new_password") as string,
        confirm_password: formData.get("confirm_password") as string,
    };

    const result = ChangePasswordSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: result.data.new_password,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: "Password changed successfully" };
}
