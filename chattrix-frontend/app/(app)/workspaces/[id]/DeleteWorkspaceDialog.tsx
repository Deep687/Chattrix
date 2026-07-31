"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { Workspace } from "@/lib/types";

type DeleteWorkspaceDialogProps = {
    workspace: Workspace;
};

/**
 * The delete-workspace trigger and confirmation modal.
 *
 * Typing the name is the gate rather than a plain "are you sure": the delete is a hard one, and it
 * cascades to invitations and membership. There is no undo to fall back on.
 */
export default function DeleteWorkspaceDialog({ workspace }: DeleteWorkspaceDialogProps) {
    const router = useRouter();

    const [showPopup, setShowPopup] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const confirmed = confirmation.trim() === workspace.name;

    const openPopup = () => {
        setConfirmation('');
        setSubmitError('');
        setShowPopup(true);
    }

    const closePopup = () => {
        setShowPopup(false);
        setSubmitError('');
    }

    const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!confirmed) {
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            await axios.delete(`/api/workspaces/${workspace.id}`);

            // Leave before refreshing, since this route no longer resolves. The refresh is still
            // needed: the sidebar list lives in the `(app)` layout, which navigation alone won't
            // re-render.
            router.replace('/workspaces');
            router.refresh();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message ?? 'Could not delete this workspace.'
                : 'Could not delete this workspace.';

            setSubmitError(message);
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={openPopup}
                className="shrink-0 text-xs font-semibold text-red-400/80 hover:text-red-400 bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 rounded-lg px-2.5 py-1 transition-colors"
            >
                Delete
            </button>

            {showPopup ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-workspace-title"
                        className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 max-h-[90vh] overflow-y-auto text-left"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="delete-workspace-title" className="text-2xl font-bold tracking-tight">
                                    Delete workspace
                                </h2>
                                <p className="mt-2 text-dim text-sm">
                                    This removes every document, member and pending invitation in{' '}
                                    <span className="text-ink font-medium">{workspace.name}</span>. It
                                    cannot be undone.
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

                        <form className="space-y-5" onSubmit={handleDelete}>
                            <div>
                                <label htmlFor="confirmation" className="block text-xs font-medium text-dim mb-1.5">
                                    Type <span className="text-ink font-semibold">{workspace.name}</span> to confirm
                                </label>
                                <input
                                    value={confirmation}
                                    onChange={(e) => setConfirmation(e.target.value)}
                                    id="confirmation" name="confirmation"
                                    type="text"
                                    autoComplete="off"
                                    className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={loading || !confirmed}
                                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Deleting…' : 'Delete workspace'}
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
