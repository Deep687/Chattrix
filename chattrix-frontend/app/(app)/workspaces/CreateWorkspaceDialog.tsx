"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation";
import axios from "axios";
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
 * The create-workspace trigger and modal.
 *
 * Client-side because it is interactive: controlled inputs, a file picker, and per-field
 * validation errors. That is also why it posts through the BFF route at `/api/workspaces`
 * rather than calling Laravel directly — browser code cannot read the httpOnly token cookie,
 * so something server-side has to attach the bearer header.
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

    const closePopup = () => {
        setShowPopup(false);
        setErrors({});
        setSubmitError('');
    }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <>
            {successMessage && (
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-lg" role="status">
                    <span>{successMessage}</span>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage('')}
                        aria-label="Dismiss"
                        className="text-green-400/70 hover:text-green-400 text-base leading-none transition-colors shrink-0"
                    >
                        ×
                    </button>
                </div>
            )}

            <button
                onClick={handleClick}
                className="bg-brand hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay"
            >
                Create workspace
            </button>

            {showPopup ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-workspace-title"
                        className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 max-h-[90vh] overflow-y-auto text-left"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="create-workspace-title" className="text-2xl font-bold tracking-tight">
                                    Create workspace
                                </h2>
                                <p className="mt-2 text-dim text-sm">
                                    This is usually your company. Only invited members can see it.
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
                                <label htmlFor="name" className="block text-xs font-medium text-dim mb-1.5">
                                    Workspace name
                                </label>
                                <input value={form.name} onChange={handleChange}
                                    id="name" name="name"
                                    type="text"
                                    placeholder="Acme Inc."
                                    className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors" />
                                {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name[0]}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-xs font-medium text-dim mb-1.5">
                                    Description <span className="text-fade">(optional)</span>
                                </label>
                                <input value={form.description} onChange={handleChange}
                                    id="description" name="description"
                                    placeholder="Internal HR, IT and compliance policies."
                                    className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors resize-none" />
                                {errors.description && <p className="mt-1.5 text-xs text-red-400">{errors.description[0]}</p>}
                            </div>

                            <div>
                                <span className="block text-xs font-medium text-dim mb-1.5">
                                    Avatar <span className="text-fade">(optional)</span>
                                </span>

                                <div className="flex items-center gap-4">
                                    {avatarPreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="size-14 rounded-lg object-cover border border-white/10 shrink-0"
                                        />
                                    ) : (
                                        <div
                                            aria-hidden="true"
                                            className="size-14 rounded-lg border border-dashed border-white/15 bg-surface grid place-items-center text-fade text-lg shrink-0"
                                        >
                                            ⬡
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <input
                                            ref={avatarInputRef}
                                            onChange={handleAvatarChange}
                                            id="avatar" name="avatar"
                                            type="file"
                                            accept={AVATAR_ACCEPTED.join(',')}
                                            className="sr-only" />

                                        <div className="flex items-center gap-3">
                                            <label
                                                htmlFor="avatar"
                                                className="cursor-pointer inline-block py-1.5 px-3 rounded-lg text-xs font-semibold text-ink bg-surface border border-white/10 hover:border-white/25 transition-colors"
                                            >
                                                {avatarFile ? 'Change image' : 'Choose image'}
                                            </label>

                                            {avatarFile && (
                                                <button
                                                    type="button"
                                                    onClick={removeAvatar}
                                                    className="text-xs text-dim hover:text-ink transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-1.5 text-xs text-fade truncate">
                                            {avatarFile
                                                ? `${avatarFile.name} · ${(avatarFile.size / 1024).toFixed(0)} KB`
                                                : 'JPG, PNG, WebP or GIF · up to 2 MB'}
                                        </p>
                                    </div>
                                </div>
                                {errors.avatar && <p className="mt-1.5 text-xs text-red-400">{errors.avatar[0]}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating…' : 'Create workspace'}
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
