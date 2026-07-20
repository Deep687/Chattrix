'use client'
import { useState } from "react"
import { useRouter } from "next/navigation";
import axios from "axios";
import HubForm, { type HubFormValues, type HubFormErrors } from "@/components/hub/HubForm";

export default function Create() {
    const router = useRouter();

    const [form, setForm] = useState<HubFormValues>({
        name: '',
        slug: '',
        description: '',
        privacy_type: 'public',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatar(file);
            setAvatarPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [errors, setErrors] = useState<HubFormErrors>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setSuccessMessage('');
        setSubmitting(true);

        const formData = new FormData();

        formData.append('name', form.name);
        formData.append("slug", form.slug);
        formData.append("description", form.description);
        formData.append("privacy_type", form.privacy_type);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            const response = await axios.post('/api/hubs', formData);
            setSuccessMessage(response.data.message ?? 'Hub created successfully!');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(error);
                setGeneralError('Something went wrong while creating your hub. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-overlay rounded-xl border border-white/5 p-8 space-y-7">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create your hub</h1>
                    <p className="mt-2 text-dim text-sm">
                        A hub is a space for your people to post, discuss, and connect.
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
                    mode="create"
                    values={form}
                    avatarPreviewUrl={avatarPreviewUrl}
                    errors={errors}
                    submitting={submitting}
                    onChange={handleChange}
                    onAvatarChange={handleAvatarChange}
                    onSubmit={handleSubmit}
                    onCancel={() => router.push('/hubs')}
                />

            </div>
        </div>
    )
}
