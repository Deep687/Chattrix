"use client"
import { useCallback, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icon";
import TextField from "@/components/ui/TextField";
import type { Workspace } from "@/lib/types";

/**
 * Invite by email, since the invitee may not have an account yet. Non-422 failures get one
 * generic message: the backend deliberately won't reveal whether an address has an account.
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
        email: ""
    });
    const [errors, setErrors] = useState<{ email?: string[] }>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    // Stable, because `Dialog` re-runs its focus effect whenever `onClose` changes identity.
    const closePopup = useCallback(() => {
        setShowPopup(false);
        setInviteForm({ email: "" });
        setErrors({});
        setSubmitError('');
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <Button variant="secondary" size="sm" onClick={() => setShowPopup(true)}>
                <Icon name="mail" className="size-3.5" />
                Invite
            </Button>

            <Dialog
                open={showPopup}
                onClose={closePopup}
                title="Invite a member"
                description="They'll get an email with a link to join this workspace. The link works only for this address and expires in 12 hours."
            >
                <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
                    {submitError && <Alert tone="error">{submitError}</Alert>}

                    {/* No autocomplete on purpose: suggestions would need a user search endpoint,
                        exposing every account on the instance to every workspace owner. */}
                    <TextField
                        name="email"
                        type="email"
                        label="Email address"
                        value={inviteForm.email}
                        onChange={handleChange}
                        autoComplete="off"
                        placeholder="jane@acme.com"
                        required
                        hint="Enter the full address. We won't say whether it already has an account."
                        error={errors.email?.[0]}
                    />

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={closePopup} disabled={loading}>Cancel</Button>
                        <Button type="submit" loading={loading}>
                            <Icon name="send" className="size-4" />
                            {loading ? 'Sending…' : 'Send invite'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    )
}
