"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  Menu,
  X,
  Zap,
  Database,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { NAV_ITEMS } from "./nav";
import { Button } from "@/components/ui/button";
import { GenerateDraftDialog } from "@/components/drafts/generate-draft-dialog";
import { signOut } from "@/lib/auth";
import type { Interest } from "@/types/database";

export function AppShell({
  children,
  interests,
  supabaseConfigured,
  userEmail,
}: {
  children: React.ReactNode;
  interests: Pick<Interest, "id" | "topic">[];
  supabaseConfigured: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapse preference.
  useEffect(() => {
    const saved = localStorage.getItem("momentum:sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("momentum:sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Close mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NavList = ({ compact }: { compact: boolean }) => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={compact ? item.label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              compact && "justify-center px-0"
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                active ? "text-primary" : ""
              )}
            />
            {!compact && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const Brand = ({ compact }: { compact: boolean }) => (
    <div
      className={cn(
        "flex h-16 items-center gap-2.5 px-5",
        compact && "justify-center px-0"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Zap className="h-5 w-5" fill="currentColor" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">
            Momentum
          </div>
          <div className="text-[11px] text-muted-foreground">
            LinkedIn content assistant
          </div>
        </div>
      )}
    </div>
  );

  const BackendBadge = ({ compact }: { compact: boolean }) =>
    compact ? null : (
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
        {supabaseConfigured ? (
          <>
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Connected to Supabase</span>
          </>
        ) : (
          <>
            <FlaskConical className="h-3.5 w-3.5 text-amber-500" />
            <span>Demo mode · mock data</span>
          </>
        )}
      </div>
    );

  const UserBlock = ({ compact }: { compact: boolean }) => {
    if (!userEmail) return null;
    return (
      <div
        className={cn(
          "mx-3 mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2",
          compact && "mx-2 justify-center"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
          {initials(userEmail.split("@")[0] || userEmail)}
        </div>
        {!compact && (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-xs font-medium">{userEmail}</div>
              <div className="text-[11px] text-muted-foreground">Signed in</div>
            </div>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <Brand compact={collapsed} />
        <div className="px-3 pb-3">
          <GenerateDraftDialog
            interests={interests}
            trigger={
              <Button
                className={cn("w-full gap-2", collapsed && "px-0")}
                size={collapsed ? "icon" : "default"}
              >
                <Zap className="h-4 w-4" />
                {!collapsed && "Generate Draft"}
              </Button>
            }
          />
        </div>
        <NavList compact={collapsed} />
        <BackendBadge compact={collapsed} />
        <UserBlock compact={collapsed} />
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full text-muted-foreground", collapsed && "px-0")}
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="ml-1">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Brand compact={false} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-3 pb-3">
              <GenerateDraftDialog
                interests={interests}
                trigger={
                  <Button className="w-full gap-2">
                    <Zap className="h-4 w-4" />
                    Generate Draft
                  </Button>
                }
              />
            </div>
            <NavList compact={false} />
            <BackendBadge compact={false} />
            <UserBlock compact={false} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" fill="currentColor" />
            </div>
            <span className="font-semibold">Momentum</span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
