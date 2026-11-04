import WorkspaceAvatar from "@/components/WorkspaceAvatar";
import Badge from "@/components/ui/Badge";
import Banner from "@/components/ui/Banner";
import Card from "@/components/ui/Card";
import type { Workspace } from "@/lib/types";
import DeleteWorkspaceDialog from "./DeleteWorkspaceDialog";
import EditWorkspaceDialog from "./EditWorkspaceDialog";

type WorkspaceHeaderProps = {
    workspace: Workspace;
    /** `null` when the members request failed — the count is then unknown, not zero. */
    memberCount: number | null;
};

/**
 * The workspace's title page. The date uses an explicit locale because this renders on the server,
 * where `undefined` would pick up the host's locale.
 */
export default function WorkspaceHeader({ workspace, memberCount }: WorkspaceHeaderProps) {
    const created = new Date(workspace.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });

    const meta = [
        memberCount !== null ? `${memberCount} ${memberCount === 1 ? "member" : "members"}` : null,
        `Created ${created}`,
    ].filter(Boolean);

    return (
        <Card stacked className="overflow-hidden motion-safe:animate-ink-fast">
            <Banner className="h-28" initial={workspace.name} />

            <div className="relative px-6 pb-7 sm:px-8">
                <div className="-mt-9 flex flex-wrap items-end justify-between gap-4">
                    <span className="rounded-card bg-surface p-1.5 ring-1 ring-hairline">
                        <WorkspaceAvatar avatar={workspace.avatar} name={workspace.name} size="lg" />
                    </span>

                    {workspace.is_owner && (
                        <div className="flex shrink-0 items-center gap-2">
                            <EditWorkspaceDialog workspace={workspace} />
                            <DeleteWorkspaceDialog workspace={workspace} />
                        </div>
                    )}
                </div>

                <p className="eyebrow mt-5">
                    <span className="text-brand-ink">01 · </span>Workspace
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="font-serif text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.75rem]">
                        {workspace.name}
                    </h1>
                    {workspace.is_owner ? <Badge>Owner</Badge> : <Badge tone="muted">Member</Badge>}
                </div>

                <p className="mt-3 max-w-2xl font-serif text-lg text-pretty text-muted italic">
                    {workspace.description || "No description yet."}
                </p>

                <div aria-hidden="true" className="rule-double mt-6" />

                <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
                    {meta.map((item) => (
                        <span key={item} className="after:ms-2 after:content-['·']">{item}</span>
                    ))}
                    <span className="text-success-ink">Private to members</span>
                </p>
            </div>
        </Card>
    );
}
