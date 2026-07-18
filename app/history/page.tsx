import { History as HistoryIcon, CheckCircle2, Layers, CalendarDays } from "lucide-react";
import { startOfWeek, format } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TopicBarChart, FrequencyBarChart } from "@/components/history/history-charts";
import { getDrafts } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const drafts = await getDrafts();
  const published = drafts
    .filter((d) => d.status === "published" && d.published_at)
    .sort(
      (a, b) =>
        +new Date(b.published_at as string) - +new Date(a.published_at as string)
    );

  // Posts per topic
  const topicMap = new Map<string, number>();
  for (const p of published) {
    topicMap.set(p.topic_tag, (topicMap.get(p.topic_tag) ?? 0) + 1);
  }
  const topicData = Array.from(topicMap.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // Posting frequency over the last 6 weeks
  const weekMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = startOfWeek(new Date(now.getTime() - i * 7 * 86_400_000), {
      weekStartsOn: 1,
    });
    weekMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of published) {
    const wk = startOfWeek(new Date(p.published_at as string), {
      weekStartsOn: 1,
    })
      .toISOString()
      .slice(0, 10);
    if (weekMap.has(wk)) weekMap.set(wk, (weekMap.get(wk) ?? 0) + 1);
  }
  const weekData = Array.from(weekMap.entries()).map(([iso, count]) => ({
    label: format(new Date(iso), "MMM d"),
    count,
  }));

  const uniqueTopics = topicData.length;
  const firstPublished = published[published.length - 1]?.published_at;

  return (
    <div>
      <PageHeader
        title="Published History"
        description="Everything you've marked as published, with topic distribution and posting frequency."
      />

      {published.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Nothing published yet"
          description="When you mark a draft as published, it will show up here with analytics."
        />
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total published"
              value={published.length}
              icon={CheckCircle2}
              accent="emerald"
            />
            <StatCard
              label="Topics covered"
              value={uniqueTopics}
              icon={Layers}
              accent="primary"
            />
            <StatCard
              label="Publishing since"
              value={firstPublished ? formatDate(firstPublished, "MMM d") : "—"}
              icon={CalendarDays}
              accent="blue"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Posts per topic</CardTitle>
                <CardDescription>Where your published content lands</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicBarChart data={topicData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Posting frequency</CardTitle>
                <CardDescription>Published posts by week (last 6 weeks)</CardDescription>
              </CardHeader>
              <CardContent>
                <FrequencyBarChart data={weekData} />
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>All published posts</CardTitle>
              <CardDescription>
                {published.length} post{published.length === 1 ? "" : "s"}, most
                recent first
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Post</th>
                      <th className="px-4 py-3 font-medium">Topic</th>
                      <th className="whitespace-nowrap px-6 py-3 font-medium">
                        Published
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {published.map((p) => (
                      <tr key={p.id} className="align-top hover:bg-muted/40">
                        <td className="max-w-md px-6 py-4">
                          <p className="line-clamp-2 text-foreground">
                            {p.content}
                          </p>
                          {p.notes && (
                            <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">
                              “{p.notes}”
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary" className="font-normal">
                            {p.topic_tag}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                          {formatDate(p.published_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
