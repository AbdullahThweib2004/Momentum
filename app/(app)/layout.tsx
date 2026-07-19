import { AppShell } from "@/components/layout/app-shell";
import { getInterests } from "@/lib/data";
import { getUserEmail } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [interests, userEmail] = await Promise.all([
    getInterests(),
    getUserEmail(),
  ]);
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
