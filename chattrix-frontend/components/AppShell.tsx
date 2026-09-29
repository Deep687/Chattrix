"use client"
import { useState, type ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { WorkspacesContext } from "./WorkspacesContext";
import type { Workspace } from "@/lib/types";

type AppShellProps = {
    children: ReactNode;
    /** Fetched in `app/(app)/layout.tsx`, since this component cannot read the token cookie. */
    workspaces: Workspace[];
};

export default function AppShell({ children, workspaces }: AppShellProps) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <WorkspacesContext.Provider value={workspaces}>
        <div className="flex min-h-dvh flex-col text-ink">
            <a
                href="#main-content"
                className="sr-only rounded-control bg-brand px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50"
            >
                Skip to content
            </a>

            <Navbar onMenuClick={() => setMobileNavOpen(true)} />

            {/* Sidebar flush to the edge; content centred in what's left, 6xl so the workspace
                page fits main + members rail without squeezing Ask under ~540px. */}
            <div className="flex grow">
                <Sidebar
                    workspaces={workspaces}
                    mobileOpen={mobileNavOpen}
                    onClose={() => setMobileNavOpen(false)}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <main id="main-content" className="mx-auto w-full max-w-6xl grow scroll-mt-20 px-4 py-8 sm:px-8 sm:py-10">
                        {children}
                    </main>

                    <Footer />
                </div>
            </div>
        </div>
        </WorkspacesContext.Provider>
    );
}
