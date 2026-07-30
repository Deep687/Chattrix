"use client"
import { useState } from "react";
import axios from "axios";
import { Workspace } from "@/lib/types";
import { useRouter } from "next/navigation";


/**
 * The invite-member trigger and modal.
 *
 * TEMPLATE ONLY — `handleFormSubmit` does not call the API yet. The endpoint
 * (`POST /workspaces/{workspace}/invitations`) does not exist; wire it up, mirroring
 * `CreateWorkspaceDialog`: post through a BFF route, map 422 into `errors`, then `router.refresh()`.
 *
 * Email is the only field. An invitation is keyed by address rather than user id because the
 * invitee may not have an account yet, so there is nothing else to identify them by.
 */

type InviteMemberDialogProps = {
    workspace: Workspace;
};


export default function InviteMemberDialog({ workspace }: InviteMemberDialogProps) {
    const [showPopup, setShowPopup] = useState(false);

    const router = useRouter();
    type InviteFormType = {
        email: string
    }

    const [inviteForm, setInviteForm] = useState<InviteFormType>({
        email: " "
    });
    const [errors, setErrors] = useState<{ email?: string[] }>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const closePopup = () => {
        setShowPopup(false);
        setInviteForm({ email: "" });
        setErrors({});
        setSubmitError('');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInviteForm({
            ...inviteForm,
            [e.target.name]: e.target.value,
        });
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSubmitError('');

        try {
            await axios.post(`/api/workspaces/${workspace.id}/invitations`, inviteForm);
            closePopup();
            router.refresh();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setSubmitError('Could not send the invite.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="shrink-0 text-xs font-semibold text-dim hover:text-ink bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 transition-colors"
            >
                Invite
            </button>

            {showPopup ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="invite-member-title"
                        className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 max-h-[90vh] overflow-y-auto text-left"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="invite-member-title" className="text-2xl font-bold tracking-tight">
                                    Invite a member
                                </h2>
                                <p className="mt-2 text-dim text-sm">
                                    They&apos;ll get an email with a link to join this workspace. The
                                    link works only for this address and expires in 7 days.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closePopup}
                                aria-label="Close"
                                className="text-dim hover:text-ink text-xl leading-none transition-colors shrink-0"
                            >
                                ×
                            </button>
                        </div>

                        {submitError && (
                            <div className="px-4 py-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg" role="alert">
                                {submitError}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleFormSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-dim mb-1.5">
                                    Email address
                                </label>
                                <input
                                    value={inviteForm.email}
                                    onChange={handleChange}
                                    id="email" name="email"
                                    type="email"
                                    autoComplete="off"
                                    placeholder="jane@acme.com"
                                    className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email[0]}</p>}

                                {/* No autocomplete on purpose: suggesting addresses would need a user
                                    search endpoint, which would expose every account on the instance
                                    to every workspace owner. Full address, typed. */}
                                <p className="mt-1.5 text-xs text-fade">
                                    Enter the full address. We won&apos;t say whether it already has an
                                    account.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending…' : 'Send invite'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closePopup}
                                    disabled={loading}
                                    className="py-2.5 px-4 rounded-lg text-sm font-semibold text-dim hover:text-ink border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    )
}
