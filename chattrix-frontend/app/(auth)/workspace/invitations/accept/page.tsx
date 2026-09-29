"use client"
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import AuthCard from "@/components/AuthCard";
import WorkspaceAvatar from "@/components/WorkspaceAvatar";
import Alert from "@/components/ui/Alert";
import Icon from "@/components/ui/Icon";
import { Button, ButtonLink, Spinner, linkClass } from "@/components/ui/Button";
import { useRefreshUser } from "@/lib/useRefreshUser";
import type { ApiResponse, WorkspaceInvitationPreview } from "@/lib/types";

/** Only the two fields this page branches on; the full user shape lives in `userSlice`. */
type SessionUser = { email: string; email_verified_at: string | null };

/**
 * Landing page for an emailed invite. Outside the proxy's auth guard (`proxy.ts`), since the invitee
 * usually has no account and a bounce to `/login` would drop the token.
 *
 * It only decides what to show, never who may join: accepting needs a verified session, and the
 * backend checks the session's address is the invited one.
 */
function AcceptInvitationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const refreshUser = useRefreshUser();

    const token = searchParams.get("token");

    const [invitation, setInvitation] = useState<WorkspaceInvitationPreview | null>(null);
    const [user, setUser] = useState<SessionUser | null>(null);
    // Derived from the URL rather than set in the effect: a missing token is knowable on first
    // render, and setting state in an effect body just to say so cascades a render.
    const [loading, setLoading] = useState(Boolean(token));
    const [error, setError] = useState(
        token ? "" : "This link is missing its invitation token."
    );
    const [joining, setJoining] = useState(false);

    // Where login/signup should send them back to, token intact.
    const returnTo = encodeURIComponent(`/workspace/invitations/accept?token=${token ?? ""}`);

    useEffect(() => {
        if (!token) {
            return;
        }

        // Session and invitation are independent — a logged-out visitor still gets the preview,
        // so neither failure should block the other.
        Promise.all([
            axios.get<ApiResponse<WorkspaceInvitationPreview>>(`/api/invitations/${token}`),
            refreshUser(),
        ])
            .then(([response, currentUser]) => {
                setInvitation(response.data.data);
                setUser(currentUser);
            })
            .catch((err) => {
                setError(
                    axios.isAxiosError(err) && err.response?.data?.message
                        ? err.response.data.message
                        : "Something went wrong while opening this invitation."
                );
            })
            .finally(() => setLoading(false));
    }, [token, refreshUser]);

    const handleAccept = useCallback(async () => {
        setJoining(true);
        setError("");

        try {
            await axios.post(`/api/invitations/${token}/accept`);
            router.push(`/workspaces/${invitation?.workspace.id}`);
        } catch (err) {
            setError(
                axios.isAxiosError(err) && err.response?.data?.message
                    ? err.response.data.message
                    : "Could not join this workspace."
            );
            setJoining(false);
        }
    }, [token, invitation, router]);

    if (loading) {
        return (
            <AuthCard eyebrow="Invitation" title="Opening your invitation">
                <p aria-live="polite" className="inline-flex items-center justify-center gap-2 text-sm text-muted">
                    <Spinner /> Checking the link…
                </p>
            </AuthCard>
        );
    }

    if (!invitation) {
        return (
            <AuthCard eyebrow="Invitation" title="Invitation unavailable" description="The link may have expired, been used, or been copied incompletely.">
                <span className="mx-auto -mt-2 inline-flex size-14 items-center justify-center rounded-full border-2 border-double border-danger/50 bg-surface text-danger-ink">
                    <Icon name="mail" className="size-6" />
                </span>
                <Alert tone="error">{error}</Alert>
                <p className="text-center text-sm text-muted">
                    Ask your workspace owner to send a new invite, or{" "}
                    <Link href="/login" className={linkClass}>go to log in</Link>.
                </p>
            </AuthCard>
        );
    }

    const wrongAccount = user !== null && user.email !== invitation.email;
    const unverified = user !== null && !wrongAccount && !user.email_verified_at;

    return (
        <AuthCard eyebrow="Invitation" title={`Join ${invitation.workspace.name}`}>
            {/* Set as a letter: letterhead, salutation, body, signature. */}
            <div className="ruled -mt-2 rounded-card border border-hairline py-5 ps-16 pe-5">
                <div className="flex items-center gap-3 border-b border-hairline pb-3">
                    <WorkspaceAvatar avatar={invitation.workspace.avatar} name={invitation.workspace.name} size="md" />
                    <div className="min-w-0">
                        <p className="eyebrow">Letterhead</p>
                        <p className="truncate font-serif text-lg leading-tight font-semibold text-ink">{invitation.workspace.name}</p>
                    </div>
                </div>

                <p className="mt-3 font-serif text-base text-ink italic">
                    Dear <span className="not-italic font-medium break-all">{invitation.email}</span>,
                </p>
                <p className="mt-1.5 text-sm text-pretty text-muted">
                    You&apos;re invited to join this workspace and ask questions against its policies.
                </p>
                {invitation.invited_by && (
                    <p className="mt-3 font-serif text-sm text-muted italic">
                        — {invitation.invited_by}
                    </p>
                )}
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            {user === null && (
                <>
                    <p className="text-center text-sm text-pretty text-muted">
                        Log in as <span className="font-medium text-ink">{invitation.email}</span> to
                        accept, or create an account with that address.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <ButtonLink href={`/login?next=${returnTo}`} fullWidth className="sm:flex-1">
                            Log in
                        </ButtonLink>
                        <ButtonLink href={`/signup?next=${returnTo}`} variant="secondary" fullWidth className="sm:flex-1">
                            Create account
                        </ButtonLink>
                    </div>
                </>
            )}

            {wrongAccount && (
                <>
                    <Alert tone="error">
                        You are signed in as {user.email}, but this invitation was sent to{" "}
                        {invitation.email}.
                    </Alert>

                    <p className="text-center text-sm">
                        <Link href="/dashboard" className={linkClass}>Back to your workspaces</Link>
                    </p>
                </>
            )}

            {unverified && (
                <>
                    <Alert tone="info">
                        Verify your email address before joining a workspace.
                    </Alert>

                    <ButtonLink href={`/verify-email?next=${returnTo}`} fullWidth>
                        Verify your email
                    </ButtonLink>
                </>
            )}

            {user !== null && !wrongAccount && !unverified && (
                <Button fullWidth onClick={handleAccept} loading={joining}>
                    {joining ? "Joining…" : `Join ${invitation.workspace.name}`}
                </Button>
            )}
        </AuthCard>
    );
}

export default function AcceptInvitation() {
    return (
        <Suspense>
            <AcceptInvitationContent />
        </Suspense>
    );
}
