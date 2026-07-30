"use client"
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WorkspaceAvatar from "./WorkspaceAvatar";
import type { Workspace } from "@/lib/types";

const NAV_ITEMS = [
    {
        label: "Home",
        href: "/dashboard",
        icon: (
            <path d="M10 2.5a1 1 0 01.6.2l7 5.25a1 1 0 01.4.8V16a1.5 1.5 0 01-1.5 1.5h-3.75a.75.75 0 01-.75-.75V13a1 1 0 00-1-1H9a1 1 0 00-1 1v3.75a.75.75 0 01-.75.75H3.5A1.5 1.5 0 012 16V8.75a1 1 0 01.4-.8l7-5.25a1 1 0 01.6-.2z" />
        ),
    },
    {
        label: "Profile",
        href: "/profile",
        icon: (
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        ),
    },{
        label: "Your Workspaces",
        href: "/workspaces",
        icon: (
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0
          01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
      ),

    }
];

type SidebarContentProps = {
    pathname: string;
    workspaces: Workspace[];
    onNavigate?: () => void;
};

function SidebarContent({ pathname, workspaces, onNavigate }: SidebarContentProps) {
    return (
        <aside className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === item.href
                        ? "bg-brand/10 text-ink font-medium"
                        : "text-dim hover:bg-white/5 hover:text-ink"
                        }`}
                >
                    <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        {item.icon}
                    </svg>
                    {item.label}
                </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-0.5">
                <p className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-fade">
                    Your workspaces
                </p>

                {workspaces.length === 0 ? (
                    <p className="px-3 text-xs text-fade leading-relaxed">
                        No workspaces yet.
                    </p>
                ) : (
                    workspaces.map((workspace) => (
                        <Link
                            key={workspace.id}
                            href={`/workspaces/${workspace.id}`}
                            onClick={onNavigate}
                            title={workspace.name}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                pathname === `/workspaces/${workspace.id}`
                                    ? "bg-brand/10 text-ink font-medium"
                                    : "text-dim hover:bg-white/5 hover:text-ink"
                            }`}
                        >
                            <WorkspaceAvatar avatar={workspace.avatar} size="sm" />
                            <span className="truncate">{workspace.name}</span>
                        </Link>
                    ))
                )}
            </div>
        </aside>
    );
}

type SidebarProps = {
    workspaces: Workspace[];
    mobileOpen?: boolean;
    onClose?: () => void;
};

export default function Sidebar({ workspaces, mobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    useEffect(() => {
        if (!mobileOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [mobileOpen, onClose]);

    return (
        <>
            <div className="hidden md:block shrink-0 w-60">
                <div className="sticky top-20 bg-overlay rounded-xl border border-white/5 p-3">
                    <SidebarContent pathname={pathname} workspaces={workspaces} />
                </div>
            </div>

            <div
                className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                aria-hidden={!mobileOpen}
            >
                <div
                    onClick={onClose}
                    className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
                />

                <div
                    className={`absolute left-0 top-0 h-full w-full max-w-xs bg-overlay border-r border-white/5 shadow-2xl transition-transform overflow-y-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <span className="text-sm font-bold tracking-tight">Menu</span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-dim hover:text-ink hover:bg-white/5 transition-colors"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* `onNavigate` closes the drawer on tap: the mobile overlay does not unmount
                        on navigation, so without it the new page renders behind the open drawer. */}
                    <div className="p-3">
                        <SidebarContent
                            pathname={pathname}
                            workspaces={workspaces}
                            onNavigate={onClose}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
