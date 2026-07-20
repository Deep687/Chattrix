"use client"
import { useState } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser } from "@/lib/features/userSlice";
import { assetUrl } from "@/lib/api";

export default function ProfilePage() {
    const user = useAppSelector((state) => state.user.data);
    const dispatch = useAppDispatch();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
        user?.avatar ? assetUrl(user.avatar) : null
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!user) {
        return null;
    }

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : null;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setAvatarPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setName(user.name);
        setAvatar(null);
        setAvatarPreviewUrl(user.avatar ? assetUrl(user.avatar) : null);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const formData = new FormData();
        formData.append("name", name);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            const response = await axios.post("/api/auth/me", formData);
            dispatch(setUser(response.data.data.user));
            setAvatar(null);
            setEditing(false);
        } catch (err) {
            console.error(err);
            setError("Something went wrong while updating your profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (editing) {
        return (
            <div className="max-w-md mx-auto">
                <div className="bg-overlay rounded-xl border border-white/5 p-8 space-y-6">
                    <h1 className="text-xl font-bold tracking-tight">Edit profile</h1>

                    {error && (
                        <p className="px-4 py-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg" role="alert">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-surface ring-1 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                {avatarPreviewUrl ? (
                                    <img src={avatarPreviewUrl} alt={name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xl font-bold text-ink">{name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <label htmlFor="avatar" className="block text-xs font-medium text-dim mb-1.5">Avatar</label>
                                <input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="block w-full text-sm text-dim file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface file:text-ink hover:file:bg-white/10 file:cursor-pointer cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-dim mb-1.5">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                maxLength={255}
                                className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2.5 rounded-lg text-sm font-medium text-dim hover:text-ink hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay disabled:opacity-60 disabled:pointer-events-none transition-colors"
                            >
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-overlay rounded-xl border border-white/5 p-8 flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-surface ring-2 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatar ? (
                        <img src={assetUrl(user.avatar)} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-ink">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <h1 className="mt-3 text-xl font-bold tracking-tight">{user.name}</h1>
                <p className="text-dim text-sm">{user.email}</p>
                {memberSince && (
                    <p className="mt-3 text-xs text-fade">Member since {memberSince}</p>
                )}

                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-ink bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                    Edit profile
                </button>
            </div>
        </div>
    );
}
