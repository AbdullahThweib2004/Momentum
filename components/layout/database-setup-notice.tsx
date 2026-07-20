import { Database, LogOut, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

// Shown when Supabase is connected but the tables don't exist yet
// (the migration hasn't been run). Prevents a server-side crash and tells the
// user exactly what to do.
export function DatabaseSetupNotice({ userEmail }: { userEmail?: string | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            One step left to finish setup
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            You&apos;re connected to Supabase, but the database tables haven&apos;t
            been created yet. Run the migration once and you&apos;re done.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ol className="flex flex-col gap-5">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <div className="text-sm">
                <p className="font-medium">Open the Supabase SQL Editor</p>
                <p className="text-muted-foreground">
                  In your project → <span className="font-medium">SQL Editor</span> → New query.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <div className="text-sm">
                <p className="font-medium">Run the migration</p>
                <p className="text-muted-foreground">
                  Paste the entire contents of this file and click Run — it creates
                  the tables, security policies, and the publish trigger:
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                  <Terminal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  supabase/migrations/0001_initial_schema.sql
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <div className="text-sm">
                <p className="font-medium">
                  (Optional) Load demo data
                </p>
                <p className="text-muted-foreground">
                  Run <span className="font-mono text-xs">supabase/seed.sql</span> to
                  populate sample interests, drafts &amp; history for your account.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
            {/* A plain link forces a fresh server render to re-check the schema. */}
            <Button asChild className="gap-2">
              <a href="/">
                <RefreshCw className="h-4 w-4" />
                I&apos;ve run it — reload
              </a>
            </Button>
          </div>
        </div>

        {userEmail && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Signed in as {userEmail}
          </p>
        )}
      </div>
    </div>
  );
}
