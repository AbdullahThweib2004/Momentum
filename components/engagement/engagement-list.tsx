"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Sparkle,
  ExternalLink,
  Trash2,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteEngagement } from "@/lib/actions";
import { relativeTime, INTERACTION_LABEL } from "@/lib/format";
import type { EngagementLogWithInterest, InteractionType } from "@/types/database";

const ICON: Record<InteractionType, typeof ThumbsUp> = {
  like: ThumbsUp,
  comment: MessageCircle,
  share: Repeat2,
  other: Sparkle,
};

const ICON_COLOR: Record<InteractionType, string> = {
  like: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  comment: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  share: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  other: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function Row({ log }: { log: EngagementLogWithInterest }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const Icon = ICON[log.interaction_type];

  function remove() {
    startTransition(async () => {
      try {
        await deleteEngagement(log.id);
        toast.success("Entry removed");
        router.refresh();
      } catch (e) {
        toast.error("Could not remove entry", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_COLOR[log.interaction_type]}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm leading-relaxed text-foreground">
          {log.post_summary}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">
            {INTERACTION_LABEL[log.interaction_type]}
          </span>
          <span>{relativeTime(log.created_at)}</span>
          {log.interest && (
            <Badge variant="secondary" className="font-normal">
              {log.interest.topic}
            </Badge>
          )}
          {log.post_url && (
            <a
              href={log.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View post
            </a>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={pending}
        onClick={remove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function EngagementList({ logs }: { logs: EngagementLogWithInterest[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No engagements logged yet"
        description="Use the form to capture posts you like, comment on, or share. Over time this shapes what Momentum drafts for you."
      />
    );
  }

  return (
    <Card className="divide-y divide-border overflow-hidden">
      {logs.map((log) => (
        <Row key={log.id} log={log} />
      ))}
    </Card>
  );
}
