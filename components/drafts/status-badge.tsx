import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/format";
import type { DraftStatus } from "@/types/database";

const DOT: Record<DraftStatus, string> = {
  draft: "bg-slate-400",
  approved: "bg-blue-500",
  published: "bg-emerald-500",
  rejected: "bg-red-500",
};

export function StatusBadge({ status }: { status: DraftStatus }) {
  return (
    <Badge variant={status} className="capitalize">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
