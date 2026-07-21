"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X, CalendarClock, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  addDailyTopic,
  deleteDailyTopic,
  toggleDailyTopic,
} from "@/lib/actions";
import type { DailyTopic } from "@/types/database";

export function DailyTopicsManager({ topics }: { topics: DailyTopic[] }) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    const v = value.trim();
    if (!v) return;
    setValue("");
    startTransition(async () => {
      try {
        await addDailyTopic(v);
        toast.success("Daily topic added");
      } catch (e) {
        toast.error("Could not add topic", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteDailyTopic(id);
        toast.success("Topic removed");
      } catch {
        toast.error("Could not remove topic");
      }
    });
  }

  function toggle(id: string, active: boolean) {
    startTransition(async () => {
      try {
        await toggleDailyTopic(id, active);
      } catch {
        toast.error("Could not update topic");
      }
    });
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Daily post topics
        </CardTitle>
        <CardDescription>
          Each day, Momentum auto-generates LinkedIn + X drafts from your top
          interests <span className="font-medium">and</span> this fixed list.
          Toggle a topic off to pause it without deleting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="e.g. A new AI tool I tried this week"
            disabled={pending}
          />
          <Button
            onClick={add}
            variant="outline"
            className="gap-1.5"
            disabled={pending}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {topics.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No daily topics yet. Add a few recurring prompts — the daily
            generator will rotate through them.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {topics.map((t) => (
              <li
                key={t.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5",
                  !t.active && "opacity-55"
                )}
              >
                <span className="flex-1 text-sm">{t.topic}</span>
                {!t.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Paused
                  </span>
                )}
                <button
                  onClick={() => toggle(t.id, !t.active)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  title={t.active ? "Pause this topic" : "Resume this topic"}
                  disabled={pending}
                >
                  {t.active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  title="Delete topic"
                  disabled={pending}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
