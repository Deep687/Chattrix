"use client"
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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

    const closePopup = () => {
        setShowPopup(false);
        setErrors({});
        setSubmitError('');
    }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <button
                type="button"
                onClick={openPopup}
                className="shrink-0 text-xs font-semibold text-dim hover:text-ink bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 transition-colors"
            >
                Edit
            </button>

            {showPopup ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-workspace-title"
                        className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 max-h-[90vh] overflow-y-auto text-left"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="edit-workspace-title" className="text-2xl font-bold tracking-tight">
                                    Edit workspace
                                </h2>
                                <p className="mt-2 text-dim text-sm">
                                    Members see these details. Documents and membership are unaffected.
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
                                    Avatar
                                </span>

                                <div className="flex items-center gap-4">
                                    {shownAvatar ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={shownAvatar}
                                            alt=""
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
                                                {workspace.avatar ? 'Replace image' : 'Choose image'}
                                            </label>

                                            {avatarFile && (
                                                <button
                                                    type="button"
                                                    onClick={clearChosenFile}
                                                    className="text-xs text-dim hover:text-ink transition-colors"
                                                >
                                                    Undo
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
                                    disabled={loading || !hasChanges}
                                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving…' : 'Save changes'}
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
