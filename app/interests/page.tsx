import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { InterestDialog } from "@/components/interests/interest-dialog";
import { InterestCard } from "@/components/interests/interest-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDrafts, getInterests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function InterestsPage() {
  const [interests, drafts] = await Promise.all([getInterests(), getDrafts()]);

  const maxWeight = Math.max(1, ...interests.map((i) => i.weight));

  const statsByInterest = new Map<string, { drafts: number; published: number }>();
  for (const d of drafts) {
    if (!d.related_interest_id) continue;
    const s = statsByInterest.get(d.related_interest_id) ?? {
      drafts: 0,
      published: 0,
    };
    s.drafts += 1;
    if (d.status === "published") s.published += 1;
    statsByInterest.set(d.related_interest_id, s);
  }

  return (
    <div>
      <PageHeader
        title="Interests"
        description="Topics you care about. Higher weight means higher priority when generating drafts — publishing a post bumps its topic automatically."
        action={<InterestDialog />}
      />

      {interests.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No interests yet"
          description="Add the topics you engage with on LinkedIn so Momentum can generate relevant drafts."
          action={<InterestDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              maxWeight={maxWeight}
              stats={
                statsByInterest.get(interest.id) ?? { drafts: 0, published: 0 }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
