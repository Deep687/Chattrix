"use client"
import { useState, type ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import type { Workspace } from "@/lib/types";

type AppShellProps = {
    children: ReactNode;
    /** Fetched in `app/(app)/layout.tsx`, since this component cannot read the token cookie. */
    workspaces: Workspace[];
};

export default function AppShell({ children, workspaces }: AppShellProps) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface text-ink">
            <Navbar onMenuClick={() => setMobileNavOpen(true)} />

            {/* 7xl rather than 6xl so the workspace page can afford a third column: nav + main
                + members rail. At 6xl the middle column fell under ~540px, too narrow for the
                Ask conversation that is the point of the page. */}
            <div className="max-w-7xl mx-auto p-8 flex gap-6">
                <Sidebar
                    workspaces={workspaces}
                    mobileOpen={mobileNavOpen}
                    onClose={() => setMobileNavOpen(false)}
                />

                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}
