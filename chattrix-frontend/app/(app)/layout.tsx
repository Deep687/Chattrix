import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import HubsProvider from "./HubsProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <HubsProvider>
      <AppShell>{children}</AppShell>
    </HubsProvider>
  );
}
