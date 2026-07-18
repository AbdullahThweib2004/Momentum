"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  X,
  Save,
  CheckCircle2,
  CalendarClock,
  Trash2,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./status-badge";
import { PublishDialog } from "./publish-dialog";
import { ScheduleDialog } from "./schedule-dialog";
import { updateDraft, setDraftStatus, deleteDraft } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import type { PostDraftWithInterest } from "@/types/database";

export function DraftEditor({ draft }: { draft: PostDraftWithInterest }) {
  const router = useRouter();
  const [content, setContent] = useState(draft.content);
  const [topicTag, setTopicTag] = useState(draft.topic_tag);
  const [notes, setNotes] = useState(draft.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const dirty =
    content !== draft.content ||
    topicTag !== draft.topic_tag ||
    notes !== (draft.notes ?? "");

  function save() {
    startTransition(async () => {
      try {
        await updateDraft(draft.id, {
          content,
          topic_tag: topicTag,
          notes: notes.trim() || null,
        });
        toast.success("Changes saved");
        router.refresh();
      } catch (e) {
        toast.error("Could not save", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  function changeStatus(status: "approved" | "rejected", label: string) {
    startTransition(async () => {
      try {
        if (dirty) {
          await updateDraft(draft.id, {
            content,
            topic_tag: topicTag,
            notes: notes.trim() || null,
          });
        }
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
        router.push("/drafts");
        router.refresh();
      } catch (e) {
        toast.error("Could not delete", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  const isPublished = draft.status === "published";
  const charCount = content.length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/drafts">
            <ArrowLeft className="h-4 w-4" />
            Back to drafts
          </Link>
        </Button>
        <StatusBadge status={draft.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit draft</CardTitle>
              <CardDescription>
                Refine the copy before you publish it on LinkedIn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic_tag">Topic tag</Label>
                <Input
                  id="topic_tag"
                  value={topicTag}
                  onChange={(e) => setTopicTag(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Post content</Label>
                  <span className="text-xs text-muted-foreground">
                    {charCount} characters
                  </span>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="resize-y font-normal leading-relaxed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Your notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="What you focused on when publishing, angle, hook…"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={save} disabled={pending || !dirty} className="gap-1.5">
                  <Save className="h-4 w-4" />
                  {dirty ? "Save changes" : "Saved"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action bar */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-2 p-4">
              {!isPublished && (
                <>
                  {draft.status !== "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={pending}
                      onClick={() => changeStatus("approved", "Draft approved")}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600/90"
                    disabled={pending}
                    onClick={() => setPublishOpen(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark as published
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={pending}
                    onClick={() => setScheduleOpen(true)}
                  >
                    <CalendarClock className="h-4 w-4" />
                    {draft.scheduled_for ? "Reschedule" : "Schedule"}
                  </Button>
                  {draft.status !== "rejected" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      disabled={pending}
                      onClick={() => changeStatus("rejected", "Draft rejected")}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto gap-1.5 text-destructive hover:text-destructive"
                disabled={pending}
                onClick={remove}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>

          {draft.scheduled_for && !isPublished && (
            <p className="text-sm text-muted-foreground">
              <CalendarClock className="mr-1.5 inline h-4 w-4 text-primary" />
              Scheduled for {formatDateTime(draft.scheduled_for)}
            </p>
          )}
          {draft.published_at && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
              Published {formatDateTime(draft.published_at)}
            </p>
          )}
        </div>

        {/* LinkedIn-style preview */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Live preview</p>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary/60" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">You</p>
                <p className="text-xs text-muted-foreground">
                  Product Marketing · Now
                </p>
              </div>
            </div>
            <div className="px-4 pb-3">
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {content || "Your post preview will appear here…"}
              </p>
            </div>
            <div className="flex items-center justify-around border-t border-border px-2 py-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 px-3 py-2">
                <ThumbsUp className="h-4 w-4" /> Like
              </span>
              <span className="flex items-center gap-1.5 px-3 py-2">
                <MessageCircle className="h-4 w-4" /> Comment
              </span>
              <span className="flex items-center gap-1.5 px-3 py-2">
                <Repeat2 className="h-4 w-4" /> Repost
              </span>
              <span className="flex items-center gap-1.5 px-3 py-2">
                <Send className="h-4 w-4" /> Send
              </span>
            </div>
          </Card>
          <p className="px-1 text-xs text-muted-foreground">
            Copy the text above, post it on LinkedIn, then mark this draft as
            published.
          </p>
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
    </div>
  );
}
