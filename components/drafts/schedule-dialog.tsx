"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scheduleDraft } from "@/lib/actions";

// Convert an ISO string to the value a datetime-local input expects.
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function ScheduleDialog({
  draftId,
  currentValue,
  open,
  onOpenChange,
}: {
  draftId: string;
  currentValue: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(toLocalInput(currentValue));
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const iso = value ? new Date(value).toISOString() : null;
        await scheduleDraft(draftId, iso);
        toast.success(iso ? "Draft scheduled" : "Schedule cleared");
        onOpenChange(false);
        router.refresh();
      } catch (e) {
        toast.error("Could not schedule draft", {
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
            <CalendarClock className="h-5 w-5 text-primary" />
            Schedule this draft
          </DialogTitle>
          <DialogDescription>
            Set a date and time you intend to publish it manually on LinkedIn.
            This is a reminder — Momentum won&apos;t post for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="scheduled_for">Intended publish time</Label>
          <Input
            id="scheduled_for"
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setValue("")}
            disabled={pending || !value}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save schedule"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
