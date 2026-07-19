import { notFound } from "next/navigation";
import { DraftEditor } from "@/components/drafts/draft-editor";
import { getDraftById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DraftDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const draft = await getDraftById(params.id);
  if (!draft) notFound();
  return <DraftEditor draft={draft} />;
}
