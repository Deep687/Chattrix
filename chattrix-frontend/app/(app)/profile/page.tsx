"use client"
import { useState } from "react";
import axios from "axios";
import AvatarPicker from "../_components/AvatarPicker";
import Alert from "@/components/ui/Alert";
import { Button, linkClass } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Banner from "@/components/ui/Banner";
import { useWorkspaces } from "@/components/WorkspacesContext";
import Link from "next/link";
import TextField from "@/components/ui/TextField";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser } from "@/lib/features/userSlice";
import { assetUrl } from "@/lib/api";

/** Your own profile: a read view, and an edit form for name and avatar. */
export default function ProfilePage() {
    const user = useAppSelector((state) => state.user.data);
    const dispatch = useAppDispatch();
    const workspaces = useWorkspaces();

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

    // Seeds the form from the store when editing starts: `useState` above ran before the user
    // loaded on a direct visit, so its initial values can be empty.
    const startEditing = () => {
        setName(user.name);
        setAvatar(null);
        setAvatarPreviewUrl(user.avatar ? assetUrl(user.avatar) : null);
        setError("");
        setEditing(true);
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
            <div className="mx-auto max-w-xl">
                <Card ruled stacked className="px-7 pt-10 pb-8 sm:px-8">
                    <p className="eyebrow">Profile · Editing</p>
                    <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">Edit profile</h1>
                    <p className="mt-1.5 text-sm text-muted">Your name and avatar are visible to members of your workspaces.</p>

                    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                        {error && <Alert tone="error">{error}</Alert>}

                        <AvatarPicker
                            label="Avatar"
                            shape="round"
                            preview={avatarPreviewUrl ?? ""}
                            fallback={
                                <span className="flex size-full items-center justify-center rounded-full bg-surface-muted font-serif text-2xl font-semibold text-brand-ink italic ring-1 ring-hairline">
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            }
                            file={avatar}
                            accept="image/*"
                            onChange={handleAvatarChange}
                            chooseLabel={avatarPreviewUrl ? "Change image" : "Choose image"}
                            hint="A square image works best."
                        />

                        <TextField
                            name="name"
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={255}
                            autoComplete="name"
                        />

                        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                            <Button type="submit" loading={saving}>
                                {saving ? "Saving…" : "Save changes"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    const owned = workspaces.filter((w) => w.is_owner).length;

    return (
        <div className="flex flex-col gap-8">
            <Card stacked className="overflow-hidden motion-safe:animate-ink-fast">
                <Banner className="h-28" initial={user.name} />

                <div className="relative px-6 pb-7 sm:px-8">
                    <div className="-mt-11 flex flex-wrap items-end justify-between gap-4">
                        <span className="rounded-full bg-surface p-1.5 ring-1 ring-hairline">
                            <UserAvatar name={user.name} avatar={user.avatar} size="lg" />
                        </span>

                        <Button variant="secondary" onClick={startEditing}>
                            <Icon name="edit" className="size-4" />
                            Edit profile
                        </Button>
                    </div>

                    <p className="eyebrow mt-5">
                        <span className="text-brand-ink">01 · </span>Profile
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <h1 className="font-serif text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.75rem]">{user.name}</h1>
                        {user.email_verified_at ? (
                            <Badge tone="success"><Icon name="check" className="size-3" />Verified</Badge>
                        ) : (
                            <Badge tone="accent">Unverified</Badge>
                        )}
                    </div>
                    <p className="mt-2 font-serif text-lg break-all text-muted italic">{user.email}</p>

                    <div aria-hidden="true" className="rule-double mt-6" />

                    <dl className="mt-4 grid gap-x-10 gap-y-2 font-mono text-xs tracking-[0.08em] uppercase sm:grid-cols-3">
                        <Stat label="Workspaces" value={String(workspaces.length)} />
                        <Stat label="You own" value={String(owned)} />
                        <Stat label="Member since" value={memberSince ?? "—"} />
                    </dl>
                </div>
            </Card>

            <div className="grid items-start gap-8 lg:grid-cols-5">
                <Card as="section" className="px-6 pt-6 pb-7 lg:col-span-3">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="eyebrow"><span className="text-brand-ink">02 · </span>Index</p>
                            <h2 className="mt-1.5 font-serif text-2xl font-semibold text-ink">Your workspaces</h2>
                        </div>
                        <Link href="/workspaces" className={`text-sm ${linkClass}`}>View all</Link>
                    </div>

                    <div aria-hidden="true" className="mt-3 border-t border-ink/80" />

                    {workspaces.length === 0 ? (
                        <p className="mt-4 font-serif text-muted italic">You aren&apos;t in any workspace yet. Create one, or ask your admin for an invite.</p>
                    ) : (
                        <ol className="mt-1">
                            {workspaces.map((workspace, i) => (
                                <li key={workspace.id}>
                                    <Link
                                        href={`/workspaces/${workspace.id}`}
                                        className="group flex items-baseline gap-3 border-b border-hairline py-3 motion-safe:transition-colors hover:text-brand-ink"
                                    >
                                        <span className="w-5 shrink-0 font-mono text-[0.6875rem] text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="min-w-0 truncate font-serif text-lg text-ink group-hover:text-brand-ink">{workspace.name}</span>
                                        <span aria-hidden="true" className="leader" />
                                        {workspace.is_owner ? <Badge>Owner</Badge> : <Badge tone="muted">Member</Badge>}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>

                <aside aria-label="Notes on privacy" className="lg:col-span-2">
                    <p className="eyebrow"><span className="text-brand-ink">03 · </span>Notes on privacy</p>
                    <div aria-hidden="true" className="mt-2 border-t border-ink/80" />
                    <ol className="mt-4 flex flex-col gap-4 font-serif text-[0.9375rem] leading-relaxed text-muted">
                        <li className="flex gap-2.5">
                            <span className="footnote shrink-0">1</span>
                            Only members of your workspaces see your name and avatar.
                        </li>
                        <li className="flex gap-2.5">
                            <span className="footnote shrink-0">2</span>
                            Platform admins can&apos;t read your workspaces&apos; documents. Isolation is enforced in the retrieval query, not just the interface.
                        </li>
                    </ol>
                </aside>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline">
            <dt className="text-muted">{label}</dt>
            <span aria-hidden="true" className="leader" />
            <dd className="font-semibold text-ink">{value}</dd>
        </div>
    );
}
