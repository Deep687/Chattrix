import InviteMemberDialog from "./InviteMemberDialog";
import type { WorkspaceMember,Workspace } from "@/lib/types";

type MembersPanelProps = {
    /** `null` when the request failed. An empty array cannot occur: every workspace has an owner. */
    members: WorkspaceMember[] | null;
    /** Mirrors the `manageMembers` policy ability, which is an `owner_id` comparison. */
    canInvite: boolean;

    workspace:Workspace ;
};

/**
 * The workspace roster, sized for the right rail rather than the main column.
 *
 * Reference material, not a management surface: rows are read-only and carry no per-member
 * actions. Invite/remove is a form, and forms belong on their own route — this panel will grow a
 * "Manage" link to it rather than the controls themselves.
 *
 * A failed fetch renders an error, never the empty state. `fetchFromBackend` collapses every
 * failure to `null`, so treating that as "no members" would show an empty roster on a workspace
 * that has four — a silent lie is worse than a visible error.
 *
 * Order comes from the backend (`WorkspaceService::fetchMembers` sorts the owner first); this
 * component does not re-sort, so there is only one place to change it.
 */
export default function MembersPanel({ members, canInvite, workspace }: MembersPanelProps) {
    return (
        <section className="bg-overlay rounded-xl border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                    <h2 className="text-sm font-semibold">Members</h2>

                    {members !== null && (
                        <span className="text-fade text-xs">
                            {members.length} {members.length === 1 ? "person" : "people"}
                        </span>
                    )}
                </div>

                {canInvite && <InviteMemberDialog workspace={workspace} />}
            </div>

            {members === null ? (
                <p className="text-sm text-red-400" role="alert">
                    Couldn&apos;t load the member list. Try reloading the page.
                </p>
            ) : (
                <ul className="divide-y divide-white/5 -my-1.5">
                    {members.map((member) => (
                        <MemberRow key={member.id} member={member} />
                    ))}
                </ul>
            )}
        </section>
    );
}

function MemberRow({ member }: { member: WorkspaceMember }) {
    return (
        <li className="flex items-center gap-2.5 py-2.5">
            <div
                aria-hidden="true"
                className="size-8 rounded-full bg-surface border border-white/10 grid place-items-center text-xs font-bold shrink-0"
            >
                {member.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{member.name}</p>

                    {member.is_owner && (
                        <span className="shrink-0 text-[0.6rem] font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/25 rounded px-1 py-0.5">
                            Owner
                        </span>
                    )}
                </div>

                <p className="text-dim text-xs truncate">{member.email}</p>
            </div>
        </li>
    );
}
