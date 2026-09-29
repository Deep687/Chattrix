"use client"
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icon";
import TextField from "@/components/ui/TextField";
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

    // Stable, because `Dialog` re-runs its focus effect whenever `onClose` changes identity.
    const closePopup = useCallback(() => {
        setShowPopup(false);
        setSubmitError('');
    }, []);

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
            <Button variant="danger-soft" size="sm" onClick={openPopup}>
                <Icon name="trash" className="size-3.5" />
                Delete
            </Button>

            <Dialog
                open={showPopup}
                onClose={closePopup}
                tone="danger"
                title="Delete workspace"
                description={
                    <>
                        This removes every document, member and pending invitation in{' '}
                        <span className="font-semibold text-ink">{workspace.name}</span>. It cannot be undone.
                    </>
                }
            >
                <form className="flex flex-col gap-5" onSubmit={handleDelete}>
                    {submitError && <Alert tone="error">{submitError}</Alert>}

                    <TextField
                        name="confirmation"
                        label={`Type “${workspace.name}” to confirm`}
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        autoComplete="off"
                    />

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={closePopup} disabled={loading}>Cancel</Button>
                        <Button type="submit" variant="danger" loading={loading} disabled={!confirmed}>
                            <Icon name="trash" className="size-4" />
                            {loading ? 'Deleting…' : 'Delete workspace'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    )
}
