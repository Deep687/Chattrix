"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Banner from "@/components/ui/Banner";
import { ButtonLink } from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";

type PublicUser = {
    id: number;
    name: string;
    avatar: string | null;
    created_at: string;
};

/** Another user's public profile: only name, avatar and join date are exposed. */
export default function PublicProfilePage() {
    const { id } = useParams<{ id: string }>();

    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const response = await axios.get(`/api/users/${id}`);
                setUser(response.data.data);
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

        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="mx-auto max-w-lg" aria-busy="true">
                <Card className="overflow-hidden">
                    <span className="sr-only">Loading profile…</span>
                    <div className="ruled h-24 border-b border-hairline" />
                    <div className="px-7 pb-8">
                        <div className="-mt-10 size-20 rounded-full bg-surface-muted ring-4 ring-surface motion-safe:animate-pulse" />
                        <div className="mt-5 h-3 w-20 rounded-[0.2rem] bg-surface-muted motion-safe:animate-pulse" />
                        <div className="mt-3 h-8 w-52 rounded-[0.2rem] bg-surface-muted motion-safe:animate-pulse" />
                        <div className="mt-6 h-3 w-full rounded-[0.2rem] bg-surface-muted motion-safe:animate-pulse" />
                    </div>
                </Card>
            </div>
        );
    }

    if (notFound || !user) {
        return (
            <div className="mx-auto max-w-lg">
                <EmptyState
                    icon="user"
                    title="User not found"
                    action={<ButtonLink href="/workspaces" variant="secondary">Back to workspaces</ButtonLink>}
                >
                    This profile doesn&apos;t exist, or it&apos;s no longer available.
                </EmptyState>
            </div>
        );
    }

    const memberSince = new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    return (
        <div className="mx-auto max-w-xl">
            <Card stacked className="overflow-hidden motion-safe:animate-ink-fast">
                <Banner className="h-24" initial={user.name} />

                <div className="relative px-7 pb-8">
                    <span className="-mt-10 inline-block rounded-full bg-surface p-1.5 ring-1 ring-hairline">
                        <UserAvatar name={user.name} avatar={user.avatar} size="lg" />
                    </span>

                    <p className="eyebrow mt-4">Member profile</p>
                    <h1 className="mt-2 font-serif text-4xl leading-[1.05] font-semibold tracking-tight text-ink">{user.name}</h1>

                    <div aria-hidden="true" className="rule-double mt-6" />

                    <dl className="mt-4 font-mono text-xs tracking-[0.08em] uppercase">
                        <div className="flex items-baseline">
                            <dt className="text-muted">Member since</dt>
                            <span aria-hidden="true" className="leader" />
                            <dd className="font-semibold text-ink">{memberSince}</dd>
                        </div>
                    </dl>
                </div>
            </Card>
        </div>
    );
}
