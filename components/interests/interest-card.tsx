"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, MoreHorizontal, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InterestDialog } from "./interest-dialog";
import { deleteInterest } from "@/lib/actions";
import type { Interest } from "@/types/database";

export interface InterestStats {
  drafts: number;
  published: number;
}

export function InterestCard({
  interest,
  stats,
  maxWeight,
}: {
  interest: Interest;
  stats: InterestStats;
  maxWeight: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      try {
        await deleteInterest(interest.id);
        toast.success("Interest deleted");
        router.refresh();
      } catch (e) {
        toast.error("Could not delete interest", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate font-semibold">{interest.topic}</h3>
          {interest.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {interest.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" disabled={pending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <InterestDialog
              interest={interest}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
            />
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

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Priority weight</span>
          <span className="font-semibold text-primary">{interest.weight}</span>
        </div>
        <Progress value={(interest.weight / maxWeight) * 100} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={interest.source === "derived_from_publish" ? "published" : "secondary"}>
          {interest.source === "derived_from_publish" ? "From publishing" : "Manual"}
        </Badge>
        <Link
          href="/drafts"
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileText className="h-3 w-3" />
          {stats.drafts} draft{stats.drafts === 1 ? "" : "s"}
        </Link>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {stats.published} published
        </span>
      </div>
    </Card>
  );
}
