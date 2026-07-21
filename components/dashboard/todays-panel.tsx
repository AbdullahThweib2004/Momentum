"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2, CalendarDays, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/drafts/platform-badge";
import { StatusBadge } from "@/components/drafts/status-badge";
import { ensureTodaysPosts } from "@/lib/actions";
import type { PostDraftWithInterest } from "@/types/database";

// Local YYYY-MM-DD (respects the user's timezone).
function localToday() {
  return new Date().toLocaleDateString("en-CA");
}

export function TodaysPanel({
  drafts,
  autoGenerate = true,
}: {
  drafts: PostDraftWithInterest[];
  autoGenerate?: boolean;
}) {
  const router = useRouter();
  const [today, setToday] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ranRef = useRef(false);

  // Set on the client to avoid a hydration mismatch.
  useEffect(() => setToday(localToday()), []);

  const todaysPosts = useMemo(() => {
    if (!today) return [];
    return drafts.filter(
      (d) => new Date(d.created_at).toLocaleDateString("en-CA") === today
    );
  }, [drafts, today]);

  const counts = useMemo(() => {
    let linkedin = 0;
    let x = 0;
    for (const d of todaysPosts) d.platform === "x" ? x++ : linkedin++;
    return { linkedin, x };
  }, [todaysPosts]);

  async function run(manual: boolean) {
    if (pending) return;
    setPending(true);
    try {
      const res = await ensureTodaysPosts(localToday());
      if (today) localStorage.setItem(`momentum:daily-run:${today}`, "1");
      if (res.created > 0) {
        toast.success(`Added ${res.created} posts for today`, {
          description: "Fresh LinkedIn + X drafts are ready to review.",
        });
        router.refresh();
      } else if (manual) {
        toast.info("Today's posts are already generated.");
      }
    } catch {
      if (manual) toast.error("Could not generate today's posts.");
    } finally {
      setPending(false);
    }
  }

  // Auto-generate once per day (per browser). The server action is also
  // idempotent, so this is safe even if it fires more than once.
  useEffect(() => {
    if (!autoGenerate || !today || ranRef.current) return;
    ranRef.current = true;
    const key = `momentum:daily-run:${today}`;
    if (localStorage.getItem(key)) return;
    if (todaysPosts.length > 0) {
      localStorage.setItem(key, "1");
      return;
    }
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const preview = todaysPosts.slice(0, 6);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/[0.06] to-transparent">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Today&apos;s posts
          </CardTitle>
          <CardDescription>
            Auto-generated each day from your interests and daily topics —
            LinkedIn + X.
          </CardDescription>
        </div>
        <Button
          onClick={() => run(true)}
          disabled={pending}
          size="sm"
          className="gap-2"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {pending ? "Generating…" : "Generate today's posts"}
        </Button>
      </CardHeader>
      <CardContent>
        {pending && todaysPosts.length === 0 ? (
          <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Writing today&apos;s LinkedIn and X drafts…
          </div>
        ) : todaysPosts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No posts for today yet. They generate automatically on your first
            visit each day — or hit “Generate today&apos;s posts”.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {todaysPosts.length} generated today
              </span>
              <span>·</span>
              <span>{counts.linkedin} LinkedIn</span>
              <span>·</span>
              <span>{counts.x} X</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {preview.map((d) => (
                <Link
                  key={d.id}
                  href={`/drafts/${d.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <PlatformBadge platform={d.platform} />
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground">
                    {d.content}
                  </p>
                </Link>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/drafts">
                Review all drafts
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
