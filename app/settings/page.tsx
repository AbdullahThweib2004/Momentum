import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export const metadata = { title: "Settings — Momentum" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Shape how Momentum sounds. These preferences will guide AI generation once you connect a model."
      />
      <SettingsForm />
      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Your voice notes and content pillars are saved locally in this
            browser for now. When you wire up an AI provider in{" "}
            <code className="rounded bg-background px-1 py-0.5">
              lib/generate.ts
            </code>
            , pass them into <code className="rounded bg-background px-1 py-0.5">generatePostDraft()</code>{" "}
            to steer tone and topic selection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
