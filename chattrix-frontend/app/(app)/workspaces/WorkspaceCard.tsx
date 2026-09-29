"use client"
import Link from "next/link";
import WorkspaceAvatar from "@/components/WorkspaceAvatar";
import Badge from "@/components/ui/Badge";
import Banner from "@/components/ui/Banner";
import Icon from "@/components/ui/Icon";
import { trackPointer } from "@/lib/trackPointer";
import type { Workspace } from "@/lib/types";

/** An index card: ruled cover, serif name, a stamp, a TOC meta line. Client-side only for the spotlight. */
export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
    const created = new Date(workspace.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });

    return (
        <Link
            href={`/workspaces/${workspace.id}`}
            onPointerMove={trackPointer}
            className="spot-card group flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface shadow-card motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 hover:shadow-sheet motion-safe:hover:-translate-y-0.5"
        >
            <Banner className="h-20" initial={workspace.name} track={false} />

            <div className="flex grow flex-col px-5 pt-4 pb-5">
                <div className="flex items-center justify-between gap-3">
                    <WorkspaceAvatar avatar={workspace.avatar} name={workspace.name} />
                    {workspace.is_owner ? <Badge>Owner</Badge> : <Badge tone="muted">Member</Badge>}
                </div>

                <h2 className="mt-3 line-clamp-2 font-serif text-xl leading-tight font-semibold text-ink">{workspace.name}</h2>

                <p className="mt-1.5 line-clamp-2 text-sm text-pretty text-muted">
                    {workspace.description || "No description yet."}
                </p>

                <dl className="mt-auto pt-5 font-mono text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                    <div className="flex items-baseline">
                        <dt>Access</dt>
                        <span aria-hidden="true" className="leader" />
                        <dd className="text-success-ink">Private</dd>
                    </div>
                    <div className="mt-1 flex items-baseline">
                        <dt>Created</dt>
                        <span aria-hidden="true" className="leader" />
                        <dd className="text-ink">{created}</dd>
                    </div>
                </dl>

                <span className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-brand-ink">
                    <span className="ink-link">Open workspace</span>
                    <Icon name="arrow" className="size-3.5 motion-safe:transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}
