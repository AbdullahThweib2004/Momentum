import { Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Platform } from "@/types/database";

const MAP: Record<
  Platform,
  { label: string; Icon: typeof Linkedin; className: string }
> = {
  linkedin: {
    label: "LinkedIn",
    Icon: Linkedin,
    className:
      "bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#5aa9ee]",
  },
  x: {
    label: "X",
    Icon: Twitter,
    className:
      "bg-foreground/10 text-foreground dark:bg-foreground/15",
  },
};

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const { label, Icon, className: cls } = MAP[platform];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        cls,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
