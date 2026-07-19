import { PageHeader } from "@/components/layout/page-header";
import { DraftsBoard } from "@/components/drafts/drafts-board";
import { GenerateDraftDialog } from "@/components/drafts/generate-draft-dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getDrafts, getInterests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const [drafts, interests] = await Promise.all([getDrafts(), getInterests()]);
  const interestOptions = interests.map((i) => ({ id: i.id, topic: i.topic }));

  return (
    <div>
      <PageHeader
        title="Drafts"
        description="Review, edit, approve, schedule, and mark posts as published."
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
      <DraftsBoard drafts={drafts} interests={interestOptions} />
    </div>
  );
}
