import Link from "next/link";
import {
  FileClock,
  CalendarCheck,
  CalendarRange,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { GenerateDraftDialog } from "@/components/drafts/generate-draft-dialog";
import { StatusBadge } from "@/components/drafts/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats, getDrafts, getInterests } from "@/lib/data";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, drafts, interests] = await Promise.all([
    getDashboardStats(),
    getDrafts(),
    getInterests(),
  ]);

  const interestOptions = interests.map((i) => ({ id: i.id, topic: i.topic }));
  const recentDrafts = drafts
    .filter((d) => d.status === "draft" || d.status === "approved")
    .slice(0, 4);
  const maxWeight = Math.max(1, ...stats.topInterests.map((i) => i.weight));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your posting momentum at a glance — pending drafts, published activity, and your most active topics."
        action={
          <GenerateDraftDialog
            interests={interestOptions}
            trigger={
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate New Draft
              </Button>
            }
          />
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending review"
          value={stats.pendingReview}
          hint="Drafts & approved posts"
          icon={FileClock}
          accent="primary"
        />
        <StatCard
          label="Published this week"
          value={stats.publishedThisWeek}
          hint="Last 7 days"
          icon={CalendarCheck}
          accent="emerald"
        />
        <StatCard
          label="Published this month"
          value={stats.publishedThisMonth}
          hint="Last 30 days"
          icon={CalendarRange}
          accent="blue"
        />
        <StatCard
          label="Tracked interests"
          value={interests.length}
          hint="Topics you care about"
          icon={TrendingUp}
          accent="amber"
        />
      </div>

      {/* Chart + top interests */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Publishing activity</CardTitle>
            <CardDescription>Posts published over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={stats.activity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top interests</CardTitle>
            <CardDescription>By weight — published topics rank higher</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {stats.topInterests.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No interests tracked yet.
              </p>
            )}
            {stats.topInterests.map((interest, idx) => (
              <div key={interest.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {idx + 1}
                    </span>
                    {interest.topic}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    weight {interest.weight}
                  </span>
                </div>
                <Progress value={(interest.weight / maxWeight) * 100} />
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/interests">
                Manage interests
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent drafts to review */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Waiting for your review</CardTitle>
            <CardDescription>
              Drafts and approved posts ready to edit or publish
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/drafts">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentDrafts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You&apos;re all caught up — nothing pending review.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/drafts/${draft.id}`}
                  className="flex items-start justify-between gap-4 py-3.5 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-lg first:pt-0"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="line-clamp-2 text-sm text-foreground">
                      {draft.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {draft.topic_tag} · {relativeTime(draft.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={draft.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
