"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Zap, Loader2, Database, FlaskConical } from "lucide-react";
import { signIn, signUp, type AuthResult } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const empty: AuthResult = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full gap-2" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction] = useFormState(signIn, empty);
  const [signUpState, signUpAction] = useFormState(signUp, empty);

  const isSignIn = mode === "signin";
  const state = isSignIn ? signInState : signUpState;
  const action = isSignIn ? signInAction : signUpAction;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-6 w-6" fill="currentColor" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Momentum · your LinkedIn content assistant
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                placeholder="••••••••"
                required
              />
            </div>

            {state.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}
            {state.message && (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                {state.message}
              </p>
            )}

            <SubmitButton label={isSignIn ? "Sign in" : "Create account"} />
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isSignIn ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignIn ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Backend status hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {isSupabaseConfigured ? (
            <>
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Connected to Supabase</span>
            </>
          ) : (
            <>
              <FlaskConical className="h-3.5 w-3.5 text-amber-500" />
              <span>Demo mode — sign-in is disabled without Supabase</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
