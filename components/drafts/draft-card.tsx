"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Check,
  X,
  CheckCircle2,
  CalendarClock,
  Trash2,
  CalendarClock as CalIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./status-badge";
import { PlatformBadge } from "./platform-badge";
import { PublishDialog } from "./publish-dialog";
import { ScheduleDialog } from "./schedule-dialog";
import { setDraftStatus, deleteDraft } from "@/lib/actions";
import { formatDate, formatDateTime } from "@/lib/format";
import type { PostDraftWithInterest } from "@/types/database";

export function DraftCard({ draft }: { draft: PostDraftWithInterest }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  function changeStatus(status: "approved" | "rejected", label: string) {
    startTransition(async () => {
      try {
        await setDraftStatus(draft.id, status);
        toast.success(label);
        router.refresh();
      } catch (e) {
        toast.error("Something went wrong", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        await deleteDraft(draft.id);
        toast.success("Draft deleted");
        router.refresh();
      } catch (e) {
        toast.error("Could not delete draft", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  const isPublished = draft.status === "published";

  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <PlatformBadge platform={draft.platform} />
          <span className="truncate rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            {draft.topic_tag}
          </span>
        </div>
        <StatusBadge status={draft.status} />
      </div>

      <Link href={`/drafts/${draft.id}`} className="group flex-1">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground line-clamp-[8] group-hover:text-foreground/80">
          {draft.content}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Created {formatDate(draft.created_at)}</span>
        {draft.scheduled_for && !isPublished && (
          <span className="inline-flex items-center gap-1 text-primary">
            <CalIcon className="h-3 w-3" />
            {formatDateTime(draft.scheduled_for)}
          </span>
        )}
        {draft.published_at && (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Published {formatDate(draft.published_at)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        {!isPublished ? (
          <>
            {draft.status !== "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={pending}
                onClick={() => changeStatus("approved", "Draft approved")}
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600/90"
              disabled={pending}
              onClick={() => setPublishOpen(true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Publish
            </Button>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={`/drafts/${draft.id}`}>
              <Pencil className="h-3.5 w-3.5" />
              View
            </Link>
          </Button>
        )}

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" disabled={pending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/drafts/${draft.id}`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {!isPublished && (
                <>
                  <DropdownMenuItem onClick={() => setScheduleOpen(true)}>
                    <CalendarClock className="h-4 w-4" />
                    Schedule
                  </DropdownMenuItem>
                  {draft.status !== "rejected" && (
                    <DropdownMenuItem
                      onClick={() => changeStatus("rejected", "Draft rejected")}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={remove}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PublishDialog
        draftId={draft.id}
        currentNotes={draft.notes}
        open={publishOpen}
        onOpenChange={setPublishOpen}
      />
      <ScheduleDialog
        draftId={draft.id}
        currentValue={draft.scheduled_for}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </Card>
  );
}
