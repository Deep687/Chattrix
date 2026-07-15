"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector } from "@/lib/hooks";
import { assetUrl } from "@/lib/api";

type Hub = {
    id: number;
    name: string;
    description: string | null;
    slug: string;
    avatar: string | null;
    privacy_type: 'public' | 'private';
    owner_id: number;
    created_at: string;
};

type EditHubForm = {
    name: string;
    slug: string;
    description: string;
    privacy_type: 'public' | 'private';
};

type ErrorMessages = Partial<Record<keyof EditHubForm, string[]>>;

export default function EditHubPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const user = useAppSelector((state) => state.user.data);

    const [hub, setHub] = useState<Hub | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [form, setForm] = useState<EditHubForm>({
        name: '',
        slug: '',
        description: '',
        privacy_type: 'public',
    });
    const [avatar, setAvatar] = useState<File | null>(null);

    const [errors, setErrors] = useState<ErrorMessages>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchHub = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const response = await axios.get(`/api/hubs/${slug}`);
                const data: Hub = response.data.data;
                setHub(data);
                setForm({
                    name: data.name,
                    slug: data.slug,
                    description: data.description ?? '',
                    privacy_type: data.privacy_type,
                });
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    setNotFound(true);
                } else {
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHub();
    }, [slug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatar(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setSuccessMessage('');
        setSaving(true);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('slug', form.slug);
        formData.append('description', form.description);
        formData.append('privacy_type', form.privacy_type);
        if (avatar) {
            formData.append('avatar', avatar);
        }

        try {
            const response = await axios.post(`/api/hubs/${slug}`, formData);
            setSuccessMessage(response.data.message ?? 'Hub updated successfully!');

            const updated: Hub = response.data.data;
            if (updated.slug !== slug) {
                router.replace(`/hub/${updated.slug}/edit`);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(error);
                setGeneralError('Something went wrong while updating your hub. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-dim text-sm">Loading hub…</p>;
    }

    if (notFound || !hub) {
        return (
            <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
                <p className="text-xl font-bold mb-2">Hub not found</p>
                <p className="text-dim text-sm">This hub doesn&apos;t exist or you don&apos;t have access to it.</p>
            </div>
        );
    }

    if (user && user.id !== hub.owner_id) {
        return (
            <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
                <p className="text-xl font-bold mb-2">Not authorized</p>
                <p className="text-dim text-sm">Only the owner of this hub can edit it.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-overlay rounded-xl border border-white/5 p-8 space-y-7">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit hub</h1>
                    <p className="mt-2 text-dim text-sm">
                        Update your hub&apos;s details.
                    </p>
                </div>

                {successMessage && (
                    <div className="px-4 py-3 text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-lg" role="alert">
                        {successMessage}
                    </div>
                )}

                {generalError && (
                    <div className="px-4 py-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg" role="alert">
                        {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-surface border border-white/10 overflow-hidden flex items-center justify-center text-fade text-xs shrink-0">
                            {avatar ? (
                                <img src={URL.createObjectURL(avatar)} alt={form.name} className="h-full w-full object-cover" />
                            ) : hub.avatar ? (
                                <img src={assetUrl(hub.avatar)} alt={form.name} className="h-full w-full object-cover" />
                            ) : (
                                'Logo'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <label htmlFor="avatar" className="block text-xs font-medium text-dim mb-1.5">Hub icon</label>
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
                        <label htmlFor="name" className="block text-xs font-medium text-dim mb-1.5">Hub name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            required
                            maxLength={255}
                            placeholder="e.g. Frontend Developers"
                            className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
                        />
                        {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-xs font-medium text-dim mb-1.5">Hub URL</label>
                        <div className="flex items-center rounded-lg border border-white/10 bg-surface focus-within:ring-1 focus-within:ring-brand focus-within:border-brand transition-colors">
                            <span className="pl-3 text-sm text-fade select-none">chattrix.com/h/</span>
                            <input
                                id="slug"
                                name="slug"
                                type="text"
                                value={form.slug}
                                onChange={handleChange}
                                required
                                maxLength={255}
                                pattern="[a-z0-9-]+"
                                placeholder="frontend-developers"
                                className="block w-full px-1 py-2.5 pr-3 bg-transparent text-sm text-ink placeholder:text-fade focus:outline-none"
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-fade">Lowercase letters, numbers, and hyphens only.</p>
                        {errors.slug && <p className="mt-1.5 text-xs text-red-400">{errors.slug[0]}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-xs font-medium text-dim mb-1.5">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            maxLength={5000}
                            placeholder="What's this hub about?"
                            className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade placeholder:leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <span className="block text-xs font-medium text-dim mb-1.5">Privacy</span>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-surface cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand/10 transition-colors">
                                <input
                                    type="radio"
                                    name="privacy_type"
                                    value="public"
                                    checked={form.privacy_type === 'public'}
                                    onChange={handleChange}
                                    className="mt-0.5 accent-brand"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-ink">Public</span>
                                    <span className="block text-xs text-fade">Anyone can view and join</span>
                                </span>
                            </label>
                            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-surface cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand/10 transition-colors">
                                <input
                                    type="radio"
                                    name="privacy_type"
                                    value="private"
                                    checked={form.privacy_type === 'private'}
                                    onChange={handleChange}
                                    className="mt-0.5 accent-brand"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-ink">Private</span>
                                    <span className="block text-xs text-fade">Only approved members can join</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.push(`/hub/${slug}`)}
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
