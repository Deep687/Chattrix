"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector } from "@/lib/hooks";
import { assetUrl } from "@/lib/api";
import HubForm, { type HubFormValues, type HubFormErrors } from "@/components/hub/HubForm";

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

export default function EditHubPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const user = useAppSelector((state) => state.user.data);

    const [hub, setHub] = useState<Hub | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [form, setForm] = useState<HubFormValues>({
        name: '',
        slug: '',
        description: '',
        privacy_type: 'public',
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

    const [errors, setErrors] = useState<HubFormErrors>({});
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
                setAvatarPreviewUrl(data.avatar ? assetUrl(data.avatar) : null);
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
            setAvatarPreviewUrl(URL.createObjectURL(file));
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
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-overlay rounded-xl border border-white/5 p-8 space-y-7 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-6 w-40 rounded bg-white/5" />
                        <div className="h-3 w-56 rounded bg-white/5" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-white/5 shrink-0" />
                        <div className="h-3 w-32 rounded bg-white/5" />
                    </div>
                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-24 rounded-lg bg-white/5" />
                </div>
            </div>
        );
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

                <HubForm
                    mode="edit"
                    values={form}
                    avatarPreviewUrl={avatarPreviewUrl}
                    errors={errors}
                    submitting={saving}
                    onChange={handleChange}
                    onAvatarChange={handleAvatarChange}
                    onSubmit={handleSubmit}
                    onCancel={() => router.push(`/hub/${slug}`)}
                />

            </div>
        </div>
    );
}
