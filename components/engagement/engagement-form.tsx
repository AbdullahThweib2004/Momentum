"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Link2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEngagement } from "@/lib/actions";
import type { Interest, InteractionType } from "@/types/database";

const NONE = "__none__";
const NEW = "__new__";

export function EngagementForm({
  interests,
}: {
  interests: Pick<Interest, "id" | "topic">[];
}) {
  const router = useRouter();
  const [postUrl, setPostUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [interaction, setInteraction] = useState<InteractionType>("like");
  const [interestId, setInterestId] = useState<string>(NONE);
  const [newInterest, setNewInterest] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) {
      toast.error("Add a short summary of what the post was about.");
      return;
    }
    startTransition(async () => {
      try {
        await createEngagement({
          post_url: postUrl.trim() || null,
          post_summary: summary.trim(),
          interaction_type: interaction,
          related_interest_id:
            interestId === NONE || interestId === NEW ? null : interestId,
          new_interest_topic: interestId === NEW ? newInterest.trim() : null,
        });
        toast.success("Engagement logged", {
          description: "It's now part of your interest signal.",
        });
        setPostUrl("");
        setSummary("");
        setInteraction("like");
        setInterestId(NONE);
        setNewInterest("");
        router.refresh();
      } catch (err) {
        toast.error("Could not log engagement", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Log an engagement</CardTitle>
        <CardDescription>
          Capture something you liked, commented on, or shared. It feeds your
          interest tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post_url">LinkedIn post URL (optional)</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="post_url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/…"
                className="pl-9"
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">What was it about?</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short summary of the post you engaged with…"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Interaction type</Label>
            <Select
              value={interaction}
              onValueChange={(v) => setInteraction(v as InteractionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="like">Liked</SelectItem>
                <SelectItem value="comment">Commented</SelectItem>
                <SelectItem value="share">Shared</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Link to an interest (optional)</Label>
            <Select value={interestId} onValueChange={setInterestId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No interest</SelectItem>
                {interests.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.topic}
                  </SelectItem>
                ))}
                <SelectItem value={NEW}>
                  <span className="flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Create new interest…
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {interestId === NEW && (
            <div className="space-y-2">
              <Label htmlFor="new_interest">New interest name</Label>
              <Input
                id="new_interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="e.g. AI evaluation & benchmarking"
              />
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Logging…" : "Log engagement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
