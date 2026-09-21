"use client"
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Alert from "@/components/ui/Alert";
import { useRefreshUser } from "@/lib/useRefreshUser";
import type { ApiResponse, WorkspaceInvitationPreview } from "@/lib/types";

/** Only the two fields this page branches on; the full user shape lives in `userSlice`. */
type SessionUser = { email: string; email_verified_at: string | null };

/**
 * The landing page for an emailed invite link.
 *
 * It lives outside the proxy's auth guard (see `proxy.ts`) because the invitee usually has no
 * account yet — bouncing them to `/login` would drop the token and strand the invite. Instead
 * the page reads the invitation unauthenticated, shows what the link is for, and sends them to
 * log in or sign up with `?next=` pointing back here.
 *
 * Accepting still requires a verified session, and the backend still checks that the session's
 * address is the invited one: this page only decides what to show, never who may join.
 */
function AcceptInvitationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const refreshUser = useRefreshUser();

    const token = searchParams.get("token");

    const [invitation, setInvitation] = useState<WorkspaceInvitationPreview | null>(null);
    const [user, setUser] = useState<SessionUser | null>(null);
    // Derived from the URL rather than set inside the effect: a missing token is knowable on
    // the first render, and setting state in an effect body just to say so cascades a render.
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
            <div className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl text-center">
                <p className="text-dim text-sm">Opening your invitation…</p>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Invitation unavailable</h1>
                <Alert tone="error">{error}</Alert>
                <Link href="/login" className="inline-block text-red-400 hover:text-red-300 transition-colors text-sm">
                    Back to log in
                </Link>
            </div>
        );
    }

    const wrongAccount = user !== null && user.email !== invitation.email;
    const unverified = user !== null && !wrongAccount && !user.email_verified_at;

    return (
        <div className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 text-center">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Join {invitation.workspace.name}
                </h1>
                <p className="mt-2 text-dim text-sm">
                    {invitation.invited_by ? `${invitation.invited_by} invited ` : "You were invited as "}
                    <span className="text-ink font-medium">{invitation.email}</span>
                    {invitation.invited_by ? " to this workspace." : "."}
                </p>
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            {user === null && (
                <>
                    <p className="text-dim text-sm">
                        Log in as <span className="text-ink font-medium">{invitation.email}</span> to
                        accept, or create an account with that address.
                    </p>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/login?next=${returnTo}`}
                            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href={`/signup?next=${returnTo}`}
                            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-dim hover:text-ink border border-white/10 hover:border-white/20 transition-colors"
                        >
                            Create account
                        </Link>
                    </div>
                </>
            )}

            {wrongAccount && (
                <>
                    <Alert tone="error">
                        You are signed in as {user.email}, but this invitation was sent to{" "}
                        {invitation.email}.
                    </Alert>

                    <Link href="/dashboard" className="inline-block text-red-400 hover:text-red-300 transition-colors text-sm">
                        Back to your dashboard
                    </Link>
                </>
            )}

            {unverified && (
                <>
                    <Alert tone="error">
                        Verify your email address before joining a workspace.
                    </Alert>

                    <Link href="/verify-email" className="inline-block text-red-400 hover:text-red-300 transition-colors text-sm">
                        Verify your email
                    </Link>
                </>
            )}

            {user !== null && !wrongAccount && !unverified && (
                <button
                    onClick={handleAccept}
                    disabled={joining}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {joining ? "Joining…" : `Join ${invitation.workspace.name}`}
                </button>
            )}
        </div>
    );
}

export default function AcceptInvitation() {
    return (
        <Suspense>
            <AcceptInvitationContent />
        </Suspense>
    );
}
