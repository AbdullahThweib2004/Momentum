import { PageHeader } from "@/components/layout/page-header";
import { EngagementForm } from "@/components/engagement/engagement-form";
import { EngagementList } from "@/components/engagement/engagement-list";
import { getEngagements, getInterests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EngagementPage() {
  const [logs, interests] = await Promise.all([
    getEngagements(),
    getInterests(),
  ]);
  const interestOptions = interests.map((i) => ({ id: i.id, topic: i.topic }));

  return (
    <div>
      <PageHeader
        title="Engagement Log"
        description="Track what you engage with on LinkedIn. Each entry is a signal that informs your tracked interests."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div>
          <EngagementForm interests={interestOptions} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {logs.length} logged engagement{logs.length === 1 ? "" : "s"}
          </p>
          <EngagementList logs={logs} />
        </div>
      </div>
    </div>
  );
}
