import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import HubsProvider from "./HubsProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <HubsProvider>
      <div className="min-h-screen bg-surface text-ink">
        <Navbar />

        <div className="max-w-6xl mx-auto p-8 flex gap-6">
          <Sidebar />

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </HubsProvider>
  );
}
