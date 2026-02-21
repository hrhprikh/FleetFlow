"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function withMessage(path: string, message: string) {
    const encoded = encodeURIComponent(message);
    return `${path}?message=${encoded}`;
}

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
        return redirect(withMessage("/login", "Email and password are required"));
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return redirect("/login?error=true&message=" + encodeURIComponent(error.message));
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function register(formData: FormData) {
    const supabase = await createClient();

    const fullName = (formData.get("full_name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "Dispatcher";

    if (!fullName || !email || !password) {
        return redirect(withMessage("/login", "Full name, email, and password are required"));
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role,
            },
        },
    });

    if (error) {
        return redirect(withMessage("/login", error.message));
    }

    redirect(withMessage("/login", "Registration successful. Please check email to confirm account."));
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient();

    const email = (formData.get("email") as string)?.trim();
    if (!email) {
        return redirect(withMessage("/login", "Email is required for reset link"));
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
        return redirect(withMessage("/login", error.message));
    }

    redirect(withMessage("/login", "Password reset link sent to your email"));
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
