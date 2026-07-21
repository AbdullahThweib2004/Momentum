"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Zap } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateDraft } from "@/lib/actions";
import type { Interest, Platform } from "@/types/database";

const NONE = "__none__";

type PlatformChoice = "linkedin" | "x" | "both";
const PLATFORM_CHOICES: { value: PlatformChoice; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "both", label: "Both" },
];

export function GenerateDraftDialog({
  interests,
  trigger,
}: {
  interests: Pick<Interest, "id" | "topic">[];
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [interestId, setInterestId] = useState<string>(NONE);
  const [platformChoice, setPlatformChoice] = useState<PlatformChoice>("both");
  const [pending, startTransition] = useTransition();

  function handleInterestChange(value: string) {
    setInterestId(value);
    if (value !== NONE) {
      const found = interests.find((i) => i.id === value);
      if (found) setTopic(found.topic);
    }
  }

  function submit() {
    const finalTopic = topic.trim();
    if (!finalTopic) {
      toast.error("Add a topic to generate a draft.");
      return;
    }
    const platforms: Platform[] =
      platformChoice === "both" ? ["linkedin", "x"] : [platformChoice];
    startTransition(async () => {
      try {
        await generateDraft({
          topic: finalTopic,
          related_interest_id: interestId === NONE ? null : interestId,
          platforms,
        });
        toast.success(
          platforms.length > 1 ? "Drafts generated" : "Draft generated",
          {
            description:
              platforms.length > 1
                ? "A LinkedIn and an X draft are waiting for your review."
                : "A new draft is waiting for your review.",
          }
        );
        setOpen(false);
        setTopic("");
        setInterestId(NONE);
        router.push("/drafts");
        router.refresh();
      } catch (e) {
        toast.error("Could not generate draft", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate a new draft
          </DialogTitle>
          <DialogDescription>
            Pick a tracked interest or type a topic. Momentum drafts a
            LinkedIn-ready post you can review and edit before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Base it on an interest (optional)</Label>
            <Select value={interestId} onValueChange={handleInterestChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No specific interest</SelectItem>
                {interests.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI Coding Assistants"
            />
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="flex gap-1.5">
              {PLATFORM_CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPlatformChoice(c.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    platformChoice === c.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {platformChoice === "both"
                ? "Creates a long-form LinkedIn post and a short X version."
                : platformChoice === "x"
                  ? "Creates a short post (≤280 characters) for X."
                  : "Creates a long-form post for LinkedIn."}
            </p>
          </div>

          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Posts are written by AI via OpenRouter, with an automatic fallback to
            built-in mock content if the API is unavailable.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending} className="gap-2">
            <Zap className="h-4 w-4" />
            {pending ? "Generating…" : "Generate draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
