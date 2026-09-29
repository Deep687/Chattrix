"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation";
import axios from "axios";
import AvatarPicker from "../_components/AvatarPicker";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icon";
import TextField from "@/components/ui/TextField";
import type { ApiResponse, Workspace } from "@/lib/types";

/** Mirrors `CreateWorkspaceRequest`: `avatar => nullable|image|max:2048` (kilobytes). */
const AVATAR_MAX_BYTES = 2048 * 1024;
const AVATAR_ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Text fields only — the avatar is a File, so it lives in its own state. */
type WorkspaceForm = {
    name: string;
    description: string;
}

// Laravel returns one array of messages per field, so this mirrors that shape rather
// than flattening to a single string — see the login page for the same pattern.
type WorkspaceFormError = Partial<Record<keyof WorkspaceForm | 'avatar', string[]>>

/**
 * The create-workspace trigger and modal. Posts through the BFF route at `/api/workspaces`
 * because browser code can't read the httpOnly token cookie to attach the bearer header itself.
 */
export default function CreateWorkspaceDialog() {
    const router = useRouter();

    const [errors, setErrors] = useState<WorkspaceFormError>({});
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPopup, setShowPopup] = useState(false);

    const handleClick = () => {
        setSuccessMessage('');
        setShowPopup(true);
    }

    const [form, setForm] = useState<WorkspaceForm>({
        name: '',
        description: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Derived from the file rather than stored alongside it — two pieces of state that must
    // agree is a bug waiting to happen.
    const avatarPreview = useMemo(
        () => (avatarFile ? URL.createObjectURL(avatarFile) : ''),
        [avatarFile]
    );

    // Object URLs pin the file in memory until revoked, so release each one once it is no
    // longer rendered.
    useEffect(() => {
        if (!avatarPreview) {
            return;
        }

        return () => URL.revokeObjectURL(avatarPreview);
    }, [avatarPreview]);

    /**
     * Validates against the same rules as the server so the user gets an answer without a
     * round trip. The server still validates — this is convenience, not the guarantee.
     */
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

    const removeAvatar = () => {
        setAvatarFile(null);
        setErrors((prev) => ({ ...prev, avatar: undefined }));

        // The input keeps its previous value otherwise, so re-picking the same file would
        // not fire a change event.
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    }

    const resetForm = () => {
        setForm({ name: '', description: '' });
        removeAvatar();
    }

    // Stable, because `Dialog` re-runs its focus effect whenever `onClose` changes identity.
    const closePopup = useCallback(() => {
        setShowPopup(false);
        setErrors({});
        setSubmitError('');
    }, []);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSubmitError('');

        // Multipart rather than JSON, because the avatar is a binary file. Axios sets the
        // multipart content type and boundary itself when handed a FormData.
        const payload = new FormData();
        payload.append('name', form.name);
        payload.append('description', form.description);

        if (avatarFile) {
            payload.append('avatar', avatarFile);
        }

        try {
            const response = await axios.post<ApiResponse<Workspace>>('/api/workspaces', payload);
            resetForm();
            setShowPopup(false);
            setSuccessMessage(`“${response.data.data.name}” was created.`);

            // Re-runs the parent Server Component's fetch so the new workspace appears in the
            // list. Without this the page would keep rendering the data it was built with.
            router.refresh();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrors(error.response.data.errors ?? {});
                } else {
                    setSubmitError(error.response?.data?.message ?? 'Could not create workspace.');
                }
            } else {
                setSubmitError('Could not create workspace.');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <>
            {successMessage && (
                <div className="relative">
                    <Alert tone="success">{successMessage}</Alert>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage('')}
                        aria-label="Dismiss"
                        className="absolute end-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-control text-muted motion-safe:transition hover:bg-surface hover:text-ink"
                    >
                        <Icon name="close" className="size-3.5" />
                    </button>
                </div>
            )}

            <Button onClick={handleClick}>
                <Icon name="plus" className="size-4" />
                Create workspace
            </Button>

            <Dialog
                open={showPopup}
                onClose={closePopup}
                title="Create workspace"
                description="This is usually your company. Only invited members can see it."
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
                        labelNote="(optional)"
                        preview={avatarPreview}
                        fallback={
                            <span className="flex size-full items-center justify-center bg-brand font-serif text-3xl font-semibold text-on-brand italic">
                                {form.name.trim() ? form.name.trim().charAt(0).toUpperCase() : <Icon name="workspace" className="size-6" />}
                            </span>
                        }
                        file={avatarFile}
                        inputRef={avatarInputRef}
                        accept={AVATAR_ACCEPTED.join(',')}
                        onChange={handleAvatarChange}
                        chooseLabel={avatarFile ? 'Change image' : 'Choose image'}
                        clearLabel="Remove"
                        onClear={removeAvatar}
                        error={errors.avatar?.[0]}
                    />

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={closePopup} disabled={loading}>Cancel</Button>
                        <Button type="submit" loading={loading}>
                            {loading ? 'Creating…' : 'Create workspace'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    )
}
