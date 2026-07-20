"use client"

export type HubFormValues = {
    name: string;
    slug: string;
    description: string;
    privacy_type: 'public' | 'private';
};

export type HubFormErrors = Partial<Record<keyof HubFormValues, string[]>>;

export default function HubForm({
    mode,
    values,
    avatarPreviewUrl,
    errors,
    submitting,
    onChange,
    onAvatarChange,
    onSubmit,
    onCancel,
}: {
    mode: 'create' | 'edit';
    values: HubFormValues;
    avatarPreviewUrl: string | null;
    errors: HubFormErrors;
    submitting: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">

            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-surface border border-white/10 overflow-hidden flex items-center justify-center text-fade text-xs shrink-0">
                    {avatarPreviewUrl ? (
                        <img src={avatarPreviewUrl} alt={values.name} className="h-full w-full object-cover" />
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
                        onChange={onAvatarChange}
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
                    value={values.name}
                    onChange={onChange}
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
                        value={values.slug}
                        onChange={onChange}
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
                    value={values.description}
                    onChange={onChange}
                    rows={4}
                    maxLength={5000}
                    placeholder="What's this hub about?"
                    className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade placeholder:leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors resize-none"
                />
                {errors.description && <p className="mt-1.5 text-xs text-red-400">{errors.description[0]}</p>}
            </div>

            <div>
                <span className="block text-xs font-medium text-dim mb-1.5">Privacy</span>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-surface cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand/10 transition-colors">
                        <input
                            type="radio"
                            name="privacy_type"
                            value="public"
                            checked={values.privacy_type === 'public'}
                            onChange={onChange}
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
                            checked={values.privacy_type === 'private'}
                            onChange={onChange}
                            className="mt-0.5 accent-brand"
                        />
                        <span>
                            <span className="block text-sm font-medium text-ink">Private</span>
                            <span className="block text-xs text-fade">Only approved members can join</span>
                        </span>
                    </label>
                </div>
                {errors.privacy_type && <p className="mt-1.5 text-xs text-red-400">{errors.privacy_type[0]}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-dim hover:text-ink hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay disabled:opacity-60 disabled:pointer-events-none transition-colors"
                >
                    {mode === 'create'
                        ? (submitting ? "Creating…" : "Create hub")
                        : (submitting ? "Saving…" : "Save changes")}
                </button>
            </div>

        </form>
    );
}
