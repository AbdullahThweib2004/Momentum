"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { DraftCard } from "./draft-card";
import { GenerateDraftDialog } from "./generate-draft-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DraftStatus, Interest, PostDraftWithInterest } from "@/types/database";

const STATUS_FILTERS: { value: DraftStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

const ALL_TOPICS = "__all__";

export function DraftsBoard({
  drafts,
  interests,
}: {
  drafts: PostDraftWithInterest[];
  interests: Pick<Interest, "id" | "topic">[];
}) {
  const [status, setStatus] = useState<DraftStatus | "all">("all");
  const [topic, setTopic] = useState<string>(ALL_TOPICS);

  const topics = useMemo(() => {
    const set = new Set(drafts.map((d) => d.topic_tag));
    return Array.from(set).sort();
  }, [drafts]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: drafts.length };
    for (const d of drafts) c[d.status] = (c[d.status] ?? 0) + 1;
    return c;
  }, [drafts]);

  const filtered = useMemo(() => {
    return drafts.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (topic !== ALL_TOPICS && d.topic_tag !== topic) return false;
      return true;
    });
  }, [drafts, status, topic]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                status === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  status === f.value
                    ? "bg-primary-foreground/20"
                    : "bg-muted-foreground/10"
                )}
              >
                {counts[f.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-56">
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TOPICS}>All topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            drafts.length === 0 ? "No drafts yet" : "No drafts match your filters"
          }
          description={
            drafts.length === 0
              ? "Generate your first draft to start building momentum."
              : "Try a different status or topic filter."
          }
          action={
            drafts.length === 0 ? (
              <GenerateDraftDialog
                interests={interests}
                trigger={<Button>Generate a draft</Button>}
              />
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("all");
                  setTopic(ALL_TOPICS);
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
}
