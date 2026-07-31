import InviteMemberDialog from "./InviteMemberDialog";
import type { WorkspaceInvitation, WorkspaceMember,Workspace } from "@/lib/types";

type MembersPanelProps = {
    /** `null` when the request failed. An empty array cannot occur: every workspace has an owner. */
    members: WorkspaceMember[] | null;
    /** Invitations awaiting acceptance. Empty for non-owners, who may not read them. */
    invitations: WorkspaceInvitation[];
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
export default function MembersPanel({ members, invitations, canInvite, workspace }: MembersPanelProps) {
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

            {canInvite && invitations.length > 0 && (
                <div className="pt-1 space-y-1 border-t border-white/5">
                    <h3 className="pt-3 text-xs font-semibold text-dim">
                        Pending
                        <span className="ml-1.5 font-normal text-fade">{invitations.length}</span>
                    </h3>

                    <ul className="divide-y divide-white/5 -my-1.5">
                        {invitations.map((invitation) => (
                            <InvitationRow key={invitation.id} invitation={invitation} />
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

/**
 * A pending invitee: address only, since they may not have an account yet.
 *
 * Expired links are flagged rather than hidden, so the owner knows to re-send.
 */
function InvitationRow({ invitation }: { invitation: WorkspaceInvitation }) {
    const isExpired = new Date(invitation.expires_at) < new Date();

    return (
        <li className="flex items-center gap-2.5 py-2.5">
            <div
                aria-hidden="true"
                className="size-8 rounded-full border border-dashed border-white/15 grid place-items-center text-xs text-fade shrink-0"
            >
                ✉
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm text-dim truncate">{invitation.email}</p>

                <p className={`text-xs ${isExpired ? "text-red-400/80" : "text-fade"}`}>
                    {isExpired ? "Link expired" : "Invited"}
                </p>
            </div>
        </li>
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
