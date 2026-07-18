"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInterest, updateInterest } from "@/lib/actions";
import type { Interest } from "@/types/database";

export function InterestDialog({
  interest,
  trigger,
}: {
  interest?: Interest;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const editing = Boolean(interest);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(interest?.topic ?? "");
  const [description, setDescription] = useState(interest?.description ?? "");
  const [weight, setWeight] = useState<number>(interest?.weight ?? 1);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!topic.trim()) {
      toast.error("A topic name is required.");
      return;
    }
    startTransition(async () => {
      try {
        if (editing && interest) {
          await updateInterest(interest.id, {
            topic: topic.trim(),
            description: description.trim() || null,
            weight,
          });
          toast.success("Interest updated");
        } else {
          await createInterest({
            topic: topic.trim(),
            description: description.trim() || null,
            weight,
          });
          toast.success("Interest added");
        }
        setOpen(false);
        if (!editing) {
          setTopic("");
          setDescription("");
          setWeight(1);
        }
        router.refresh();
      } catch (e) {
        toast.error("Could not save interest", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add interest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {editing ? "Edit interest" : "Add a new interest"}
          </DialogTitle>
          <DialogDescription>
            Track a topic you care about. Higher-weight topics are prioritized
            when generating drafts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI in Go-To-Market"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What angle within this topic matters to you?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Priority weight</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              max={100}
              value={weight}
              onChange={(e) => setWeight(Math.max(1, Number(e.target.value) || 1))}
            />
            <p className="text-xs text-muted-foreground">
              Increases automatically each time you publish a post on this topic.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Add interest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
