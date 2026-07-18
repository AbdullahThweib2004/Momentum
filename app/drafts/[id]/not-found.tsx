import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Draft not found"
      description="This draft may have been deleted or never existed."
      action={
        <Button asChild>
          <Link href="/drafts">Back to drafts</Link>
        </Button>
      }
    />
  );
}
