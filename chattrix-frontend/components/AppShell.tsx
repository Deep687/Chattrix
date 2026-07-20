"use client"
import { useState, type ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface text-ink">
            <Navbar onMenuClick={() => setMobileNavOpen(true)} />

            <div className="max-w-6xl mx-auto p-8 flex gap-6">
                <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}
