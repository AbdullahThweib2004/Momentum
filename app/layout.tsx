import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getInterests } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Momentum — LinkedIn Content Assistant",
  description:
    "Track your interests, generate LinkedIn post drafts, and keep your posting momentum going.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const interests = await getInterests();
  const interestOptions = interests.map((i) => ({ id: i.id, topic: i.topic }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <TooltipProvider delayDuration={200}>
          <AppShell
            interests={interestOptions}
            supabaseConfigured={isSupabaseConfigured}
          >
            {children}
          </AppShell>
          <Toaster position="bottom-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
