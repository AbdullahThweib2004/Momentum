"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { publishDraft } from "@/lib/actions";

export function PublishDialog({
  draftId,
  currentNotes,
  open,
  onOpenChange,
}: {
  draftId: string;
  currentNotes: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      try {
        await publishDraft(draftId, notes.trim() || null);
        toast.success("Marked as published 🎉", {
          description: "The related interest was weighted higher for next time.",
        });
        onOpenChange(false);
        router.refresh();
      } catch (e) {
        toast.error("Could not mark as published", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Mark as published
          </DialogTitle>
          <DialogDescription>
            Confirm you&apos;ve posted this on LinkedIn. Publishing feeds back
            into interest tracking — this topic gets weighted higher for future
            drafts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you focus on? Any angle or hook you leaned into?"
            rows={3}
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5" />
          Post it on LinkedIn first, then confirm here.
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={pending}
            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
          >
            {pending ? "Saving…" : "Confirm published"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
