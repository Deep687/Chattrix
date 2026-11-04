"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AvatarPicker from "../../_components/AvatarPicker";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icon";
import TextField from "@/components/ui/TextField";
import { assetUrl } from "@/lib/api";
import type { Workspace } from "@/lib/types";

/** Mirrors `UpdateWorkspaceRequest`: `avatar => nullable|image|max:2048` (kilobytes). */
const AVATAR_MAX_BYTES = 2048 * 1024;
const AVATAR_ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type WorkspaceForm = {
    name: string;
    description: string;
}

type WorkspaceFormError = Partial<Record<keyof WorkspaceForm | 'avatar', string[]>>

type EditWorkspaceDialogProps = {
    workspace: Workspace;
};

/**
 * The edit-workspace trigger and modal.
 *
 * Only fields the user actually changed are sent: every rule in `UpdateWorkspaceRequest` is
 * `sometimes`, so an omitted key is left untouched. The existing avatar can be replaced but not
 * removed — clearing it would blank the column and orphan the file on disk.
 */
export default function EditWorkspaceDialog({ workspace }: EditWorkspaceDialogProps) {
    const router = useRouter();

    const [showPopup, setShowPopup] = useState(false);
    const [errors, setErrors] = useState<WorkspaceFormError>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<WorkspaceForm>({
        name: workspace.name,
        description: workspace.description ?? '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const newAvatarPreview = useMemo(
        () => (avatarFile ? URL.createObjectURL(avatarFile) : ''),
        [avatarFile]
    );

    // Object URLs pin the file in memory until revoked.
    useEffect(() => {
        if (!newAvatarPreview) {
            return;
        }

        return () => URL.revokeObjectURL(newAvatarPreview);
    }, [newAvatarPreview]);

    const existingAvatar = workspace.avatar ? assetUrl(workspace.avatar) : '';
    const shownAvatar = newAvatarPreview || existingAvatar;

    const clearChosenFile = () => {
        setAvatarFile(null);
        setErrors((prev) => ({ ...prev, avatar: undefined }));

        // Without this the input keeps its value, so re-picking the same file fires no change event.
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    }

    const openPopup = () => {
        setForm({ name: workspace.name, description: workspace.description ?? '' });
        clearChosenFile();
        setErrors({});
        setSubmitError('');
        setShowPopup(true);
    }

    // Stable, because `Dialog` re-runs its focus effect whenever `onClose` changes identity.
    const closePopup = useCallback(() => {
        setShowPopup(false);
        setErrors({});
        setSubmitError('');
    }, []);

    /** Same rules as the server, so the user gets an answer without a round trip. */
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        setErrors((prev) => ({ ...prev, avatar: undefined }));

        if (!file) {
            setAvatarFile(null);
            return;
        }

        if (!AVATAR_ACCEPTED.includes(file.type)) {
            setErrors((prev) => ({ ...prev, avatar: ['Choose a JPG, PNG, WebP or GIF image.'] }));
            setAvatarFile(null);
            return;
        }

        if (file.size > AVATAR_MAX_BYTES) {
            setErrors((prev) => ({ ...prev, avatar: ['That image is larger than 2 MB.'] }));
            setAvatarFile(null);
            return;
        }

        setAvatarFile(file);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const nameChanged = form.name !== workspace.name;
    const descriptionChanged = form.description !== (workspace.description ?? '');
    const hasChanges = nameChanged || descriptionChanged || avatarFile !== null;

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSubmitError('');

        const payload = new FormData();

        // PHP parses multipart bodies on POST only, so a real PATCH would arrive with no file at
        // all. Laravel rewrites the verb from this field before routing.
        payload.append('_method', 'PATCH');

        if (nameChanged) {
            payload.append('name', form.name);
        }

        if (descriptionChanged) {
            payload.append('description', form.description);
        }

        if (avatarFile) {
            payload.append('avatar', avatarFile);
        }

        try {
            await axios.post(`/api/workspaces/${workspace.id}`, payload);
            setShowPopup(false);
            clearChosenFile();
            router.refresh();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrors(error.response.data.errors ?? {});
                } else {
                    setSubmitError(error.response?.data?.message ?? 'Could not save changes.');
                }
            } else {
                setSubmitError('Could not save changes.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button variant="secondary" size="sm" onClick={openPopup}>
                <Icon name="edit" className="size-3.5" />
                Edit
            </Button>

            <Dialog
                open={showPopup}
                onClose={closePopup}
                title="Edit workspace"
                description="Members see these details. Documents and membership are unaffected."
            >
                <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
                    {submitError && <Alert tone="error">{submitError}</Alert>}

                    <TextField
                        name="name"
                        label="Workspace name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Acme Inc."
                        required
                        error={errors.name?.[0]}
                    />

                    <TextField
                        name="description"
                        label="Description"
                        labelNote="(optional)"
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Internal HR, IT and compliance policies."
                        error={errors.description?.[0]}
                    />

                    <AvatarPicker
                        label="Avatar"
                        preview={shownAvatar}
                        fallback={
                            <span className="flex size-full items-center justify-center bg-brand font-serif text-3xl font-semibold text-on-brand italic">
                                {form.name.trim() ? form.name.trim().charAt(0).toUpperCase() : <Icon name="workspace" className="size-6" />}
                            </span>
                        }
                        file={avatarFile}
                        inputRef={avatarInputRef}
                        accept={AVATAR_ACCEPTED.join(',')}
                        onChange={handleAvatarChange}
                        chooseLabel={workspace.avatar ? 'Replace image' : 'Choose image'}
                        clearLabel="Undo"
                        onClear={clearChosenFile}
                        error={errors.avatar?.[0]}
                    />

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={closePopup} disabled={loading}>Cancel</Button>
                        <Button type="submit" loading={loading} disabled={!hasChanges}>
                            {loading ? 'Saving…' : 'Save changes'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    )
}
