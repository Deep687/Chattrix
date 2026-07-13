'use client'
import { useState } from "react"
import axios from "axios";

export default function Create() {

    type CreateHubForm = {
        name: string;
        slug: string;
        description: string;
        privacy_type: 'public' | 'private';
    };
    const [form, setForm] = useState<CreateHubForm>({
        name: '',
        slug: '',
        description: '',
        privacy_type: 'public'

    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const [avatar, setAvatar] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAvatar(file);
        }
    };

    type ErrorMessages = Partial<Record<keyof CreateHubForm, string[]>>;
    const [errors, setErrors] = useState<ErrorMessages>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [generalError, setGeneralError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setSuccessMessage('');

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
        }

    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-overlay rounded-xl border border-white/5 p-8 space-y-7">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create your hub</h1>
                    <p className="mt-2 text-dim text-sm">
                        A hub is a space for your community to post, discuss, and connect.
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
                        <div className="h-16 w-16 rounded-full bg-surface border border-white/10 flex items-center justify-center text-fade text-xs shrink-0">
                            Logo
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
                                <input type="radio" name="privacy_type" value="public" onChange={handleChange} defaultChecked className="mt-0.5 accent-brand" />
                                <span>
                                    <span className="block text-sm font-medium text-ink">Public</span>
                                    <span className="block text-xs text-fade">Anyone can view and join</span>
                                </span>
                            </label>
                            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-surface cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand/10 transition-colors">
                                <input type="radio" name="privacy_type" value="private" onChange={handleChange} className="mt-0.5 accent-brand" />
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
                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-dim hover:text-ink hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors"
                        >
                            Create hub
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )

}