"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
  message?: string;
}

// Sign in with email + password. Redirects to the dashboard on success.
export async function signIn(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
}

// Sign up with email + password. Depending on your Supabase settings, this
// either signs you straight in or sends a confirmation email first.
export async function signUp(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters." };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // If email confirmation is required, there's no active session yet.
  if (!data.session) {
    return {
      message:
        "Account created. Check your inbox to confirm your email, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
