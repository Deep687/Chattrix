import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import InviteMemberDialog from "./InviteMemberDialog";
import type { Workspace, WorkspaceInvitation, WorkspaceMember } from "@/lib/types";

type MembersPanelProps = {
    /** `null` when the request failed. An empty array cannot occur: every workspace has an owner. */
    members: WorkspaceMember[] | null;
    /** Invitations awaiting acceptance. Empty for non-owners, who may not read them. */
    invitations: WorkspaceInvitation[];
    /** Mirrors the `manageMembers` policy ability, which is an `owner_id` comparison. */
    canInvite: boolean;
    workspace: Workspace;
};

/**
 * The roster, sized for the right rail. Read-only reference material; management gets its own route.
 *
 * A failed fetch renders an error, never the empty state — showing "no members" on a workspace that
 * has four is a silent lie. Order comes from the backend (owner first); this doesn't re-sort.
 */
export default function MembersPanel({ members, invitations, canInvite, workspace }: MembersPanelProps) {
    return (
        <Card className="px-5 pt-5 pb-6">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="eyebrow">
                        <span className="text-brand-ink">04 · </span>Members
                    </p>
                    <h2 className="mt-1.5 font-serif text-xl font-semibold text-ink">
                        {members !== null ? `${members.length} ${members.length === 1 ? "person" : "people"}` : "The roster"}
                    </h2>
                </div>

                {canInvite && <InviteMemberDialog workspace={workspace} />}
            </div>

            <div aria-hidden="true" className="mt-3 border-t border-ink/80" />

            {members === null ? (
                <div className="mt-4">
                    <Alert tone="error">Couldn&apos;t load the member list. Try reloading the page.</Alert>
                </div>
            ) : (
                <ul className="mt-1 divide-y divide-hairline">
                    {members.map((member) => (
                        <MemberRow key={member.id} member={member} />
                    ))}
                </ul>
            )}

            {canInvite && invitations.length > 0 && (
                <div className="mt-4 border-t border-hairline pt-4">
                    <p className="eyebrow">Pending · {invitations.length}</p>

                    <ul className="mt-1 divide-y divide-hairline">
                        {invitations.map((invitation) => (
                            <InvitationRow key={invitation.id} invitation={invitation} />
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}

/** A pending invitee: address only, since they may not have an account. Expired links are flagged, not hidden, so the owner re-sends. */
function InvitationRow({ invitation }: { invitation: WorkspaceInvitation }) {
    const isExpired = new Date(invitation.expires_at) < new Date();

    return (
        <li className="flex items-center gap-3 py-2.5">
            <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-control text-muted">
                <Icon name="mail" className="size-4" />
            </span>

            <p className="min-w-0 flex-1 truncate font-serif text-[0.9375rem] text-muted italic">{invitation.email}</p>

            {isExpired ? <Badge tone="danger">Expired</Badge> : <Badge tone="muted">Invited</Badge>}
        </li>
    );
}

function MemberRow({ member }: { member: WorkspaceMember }) {
    return (
        <li className="flex items-center gap-3 py-3">
            <UserAvatar name={member.name} size="md" />

            <div className="min-w-0 flex-1">
                <div className="flex items-baseline">
                    <p className="min-w-0 truncate text-sm font-medium text-ink">{member.name}</p>
                    <span aria-hidden="true" className="leader" />
                    {member.is_owner ? <Badge>Owner</Badge> : <Badge tone="muted">Member</Badge>}
                </div>
                <p className="truncate text-xs text-muted">{member.email}</p>
            </div>
        </li>
    );
}
