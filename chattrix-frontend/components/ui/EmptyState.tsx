"use client"
import type { ReactNode } from "react";
import { trackPointer } from "@/lib/trackPointer";
import Icon, { type IconName } from "./Icon";

type EmptyStateProps = {
    icon: IconName;
    title: string;
    children: ReactNode;
    action?: ReactNode;
};

/**
 * Every list's zero state, set like a blank page: what's missing, why, and the one next step.
 * The wrapper carries the border glow (`.spot-card`) and the page the line glow (`.ruled-live`):
 * both draw with `::before`, so they can't share an element.
 */
export default function EmptyState({ icon, title, children, action }: EmptyStateProps) {
    return (
        <div onPointerMove={trackPointer} className="spot-card rounded-card">
            <div className="ruled ruled-live flex flex-col items-center overflow-hidden rounded-card border border-hairline px-6 py-12 text-center">
                <span className="inline-flex size-11 items-center justify-center rounded-control border border-control bg-surface text-brand-ink">
                    <Icon name={icon} className="size-5" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-ink italic">{title}</h3>
                <div className="mt-1.5 max-w-sm text-sm text-pretty text-muted">{children}</div>
                {action && <div className="mt-6">{action}</div>}
            </div>
        </div>
    );
}
