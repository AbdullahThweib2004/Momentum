import { AppShell } from "@/components/layout/app-shell";
import { DatabaseSetupNotice } from "@/components/layout/database-setup-notice";
import { getInterests, getSchemaStatus } from "@/lib/data";
import { getUserEmail } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [schema, userEmail] = await Promise.all([
    getSchemaStatus(),
    getUserEmail(),
  ]);

  // Connected to Supabase, but the migration hasn't been run yet — show a
  // friendly setup screen instead of crashing on the first query.
  if (schema === "missing") {
    return <DatabaseSetupNotice userEmail={userEmail} />;
  }

  const interests = await getInterests();
  const interestOptions = interests.map((i) => ({ id: i.id, topic: i.topic }));

  return (
    <AppShell
      interests={interestOptions}
      supabaseConfigured={isSupabaseConfigured}
      userEmail={userEmail}
    >
      {children}
    </AppShell>
  );
}
