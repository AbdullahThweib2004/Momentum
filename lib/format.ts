import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import type { DraftStatus, InteractionType } from "@/types/database";

export function fromISO(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

export function formatDate(value: string | null | undefined, pattern = "MMM d, yyyy") {
  const d = fromISO(value);
  return d ? format(d, pattern) : "—";
}

export function formatDateTime(value: string | null | undefined) {
  const d = fromISO(value);
  return d ? format(d, "MMM d, yyyy · h:mm a") : "—";
}

export function relativeTime(value: string | null | undefined) {
  const d = fromISO(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : "—";
}

export const STATUS_LABEL: Record<DraftStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

export const INTERACTION_LABEL: Record<InteractionType, string> = {
  like: "Liked",
  comment: "Commented",
  share: "Shared",
  other: "Other",
};
