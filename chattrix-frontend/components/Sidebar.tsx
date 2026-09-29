"use client"
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WorkspaceAvatar from "./WorkspaceAvatar";
import Icon, { type IconName } from "./ui/Icon";
import type { Workspace } from "@/lib/types";

const NAV_ITEMS: { label: string; href: string; icon: IconName }[] = [
    { label: "Workspaces", href: "/workspaces", icon: "workspace" },
    { label: "Profile", href: "/profile", icon: "user" },
];

type SidebarContentProps = {
    pathname: string;
    workspaces: Workspace[];
    onNavigate?: () => void;
};

/** Active item: brand wash, bold ink, and a bar in the margin, so it doesn't rely on colour alone. */
function itemClass(active: boolean) {
    return `relative flex items-center gap-3 rounded-control px-3 py-2 text-sm motion-safe:transition-colors ${active
        ? "bg-brand/10 font-semibold text-ink before:absolute before:inset-y-1.5 before:-start-3 before:w-[3px] before:rounded-e-sm before:bg-brand"
        : "text-muted hover:bg-surface-muted hover:text-ink"
        }`;
}

function SidebarContent({ pathname, workspaces, onNavigate }: SidebarContentProps) {
    const current = workspaces.find((w) => pathname === `/workspaces/${w.id}`);

    return (
        <div className="flex h-full flex-col">
            {/* Principle 3: always show whose policies you're in. */}
            <Link
                href={current ? `/workspaces/${current.id}` : "/workspaces"}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-card border border-hairline bg-canvas p-3 motion-safe:transition hover:border-control"
            >
                {current ? (
                    <WorkspaceAvatar avatar={current.avatar} name={current.name} size="md" />
                ) : (
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-control border border-control text-brand-ink">
                        <Icon name="workspace" />
                    </span>
                )}
                <span className="min-w-0 flex-1">
                    <span className="eyebrow block">{current ? "Current" : "Chattrix"}</span>
                    <span className="mt-0.5 block truncate font-serif text-[1.05rem] leading-snug font-semibold text-ink">
                        {current ? current.name : "All workspaces"}
                    </span>
                </span>
                <Icon name="chevron" className="size-4 -rotate-90 text-muted motion-safe:transition-transform group-hover:translate-x-0.5" />
            </Link>

            <nav aria-label="Main" className="mt-6">
                <p className="eyebrow px-3">Navigate</p>
                <ul className="mt-2 flex flex-col gap-0.5">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                                    <Icon name={item.icon} className={`size-4.5 ${active ? "text-brand-ink" : ""}`} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <nav aria-label="Your workspaces" className="mt-6">
                <div className="flex items-center justify-between px-3">
                    <p className="eyebrow">Your workspaces</p>
                    <span className="font-mono text-[0.6875rem] text-muted tabular-nums">{String(workspaces.length).padStart(2, "0")}</span>
                </div>

                {workspaces.length === 0 ? (
                    <p className="mt-2 px-3 font-serif text-sm text-muted italic">
                        None yet. Create one, or ask your admin for an invite.
                    </p>
                ) : (
                    <ul className="mt-2 flex flex-col gap-0.5">
                        {workspaces.map((workspace) => {
                            const href = `/workspaces/${workspace.id}`;
                            const active = pathname === href;
                            return (
                                <li key={workspace.id}>
                                    <Link href={href} onClick={onNavigate} title={workspace.name} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                                        <WorkspaceAvatar avatar={workspace.avatar} name={workspace.name} size="sm" />
                                        <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
                                        {workspace.is_owner && (
                                            <span className="font-mono text-[0.625rem] tracking-[0.12em] text-muted uppercase">Own</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <Link
                    href="/workspaces"
                    onClick={onNavigate}
                    className="mt-3 flex items-center justify-center gap-2 rounded-control border border-dashed border-control px-3 py-2 text-sm font-medium text-muted motion-safe:transition hover:border-brand hover:bg-brand/5 hover:text-brand-ink"
                >
                    <Icon name="plus" className="size-4" />
                    New workspace
                </Link>
            </nav>

            {/* Pinned to the foot of the panel, set as a footnote in the product's own citation style. */}
            <div className="mt-auto pt-8">
                <div className="rounded-card border border-hairline bg-canvas p-3.5">
                    <p className="flex items-center gap-2 eyebrow text-brand-ink">
                        <Icon name="shield" className="size-3.5" />
                        Isolated by design
                    </p>
                    <p className="mt-1.5 font-serif text-[0.9375rem] leading-snug text-muted italic">
                        Answers only ever come from the workspace you ask in.
                    </p>
                </div>
            </div>
        </div>
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
            {/* A full-height panel flush to the left edge, pinned under the masthead. */}
            <aside className="hidden w-68 shrink-0 border-e border-hairline bg-surface md:block">
                <div className="sticky top-15 h-[calc(100dvh-3.75rem)] overflow-y-auto px-4 py-5">
                    <SidebarContent pathname={pathname} workspaces={workspaces} />
                </div>
            </aside>

            <div
                className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                aria-hidden={!mobileOpen}
            >
                <div
                    onClick={onClose}
                    className={`absolute inset-0 bg-scrim motion-safe:transition-opacity motion-safe:duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
                />

                <div
                    className={`absolute start-0 top-0 flex h-full w-full max-w-xs flex-col border-e border-hairline bg-surface shadow-pop motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex h-15 shrink-0 items-center justify-between border-b border-hairline px-4">
                        <span className="eyebrow">Menu</span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            className="inline-flex size-9 items-center justify-center rounded-control text-muted motion-safe:transition hover:bg-surface-muted hover:text-ink"
                        >
                            <Icon name="close" className="size-4" />
                        </button>
                    </div>

                    {/* `onNavigate` closes the drawer on tap: the overlay doesn't unmount on navigation. */}
                    <div className="grow overflow-y-auto px-4 py-5">
                        <SidebarContent pathname={pathname} workspaces={workspaces} onNavigate={onClose} />
                    </div>
                </div>
            </div>
        </>
    );
}
