import WorkspaceAvatar from "@/components/WorkspaceAvatar";
import type { Workspace } from "@/lib/types";

type WorkspaceHeaderProps = {
    workspace: Workspace;
    /** `null` when the members request failed — the count is then unknown, not zero. */
    memberCount: number | null;
};

/**
 * Identity block for a workspace: who it is, and whether the caller owns it.
 *
 * The date is formatted with an explicit locale rather than the ambient one. This renders on the
 * server, so `undefined` would pick up the *server's* locale — a US host would show "Mar 2026" to
 * a user whose browser would have said "Mär 2026", with nothing to indicate why.
 */
export default function WorkspaceHeader({ workspace, memberCount }: WorkspaceHeaderProps) {
    const created = new Date(workspace.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });

    return (
        <div className="bg-overlay rounded-xl border border-white/5 p-6">
            <div className="flex items-start gap-5">
                <WorkspaceAvatar avatar={workspace.avatar} size="lg" />

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold tracking-tight truncate">
                            {workspace.name}
                        </h1>

                        {workspace.is_owner && (
                            <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/25 rounded px-1.5 py-0.5">
                                Owner
                            </span>
                        )}
                    </div>

                    <p className="text-dim text-sm leading-relaxed mt-1.5">
                        {workspace.description || "No description yet."}
                    </p>

                    <p className="text-fade text-xs mt-3">
                        {memberCount !== null && (
                            <>
                                {memberCount} {memberCount === 1 ? "member" : "members"}
                                <span className="mx-1.5">·</span>
                            </>
                        )}
                        Created {created}
                    </p>
                </div>
            </div>
        </div>
    );
}
