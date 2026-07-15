"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addJoinedHub } from "@/lib/features/hubsSlice";
import { assetUrl } from "@/lib/api";
import HubMembers from "./HubMembers";

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

export default function HubDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const user = useAppSelector((state) => state.user.data);
    const joinedHubs = useAppSelector((state) => state.hubs.joined);
    const dispatch = useAppDispatch();

    const [hub, setHub] = useState<Hub | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState("");
    const [justJoined, setJustJoined] = useState(false);

    useEffect(() => {
        const fetchHub = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const response = await axios.get(`/api/hubs/${slug}`);
                setHub(response.data.data);
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

    const createdAt = new Date(hub.created_at).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });

    const isOwner = user?.id === hub.owner_id;
    const isMember = isOwner || joinedHubs.some((joined) => joined.id === hub.id) || justJoined;

    const handleJoin = async () => {
        setJoining(true);
        setJoinError("");

        try {
            const response = await axios.post(`/api/hubs/${hub.slug}/join`);
            dispatch(addJoinedHub(response.data.data));
            setJustJoined(true);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                setJoinError("This is a private hub. Only members can access it.");
            } else if (axios.isAxiosError(error) && error.response?.status === 409) {
                setJustJoined(true);
            } else {
                console.error(error);
                setJoinError("Something went wrong while joining. Please try again.");
            }
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-overlay rounded-xl border border-white/5 p-8">
                <div className="flex items-start gap-5">
                    <div className="h-16 w-16 rounded-full bg-surface ring-2 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {hub.avatar ? (
                            <img
                                src={assetUrl(hub.avatar)}
                                alt={hub.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold tracking-tight truncate">{hub.name}</h1>
                                <p className="mt-0.5 text-dim text-sm">/h/{hub.slug}</p>
                            </div>

                            {isOwner && (
                                <Link
                                    href={`/hub/${hub.slug}/edit`}
                                    className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-ink bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                >
                                    Edit hub
                                </Link>
                            )}

                            {!isOwner && (
                                isMember ? (
                                    <span className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-dim bg-white/5 border border-white/10">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z" clipRule="evenodd" />
                                        </svg>
                                        Joined
                                    </span>
                                ) : hub.privacy_type === 'public' ? (
                                    <button
                                        type="button"
                                        onClick={handleJoin}
                                        disabled={joining}
                                        className="shrink-0 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay disabled:opacity-60 disabled:pointer-events-none transition-colors"
                                    >
                                        {joining ? "Joining…" : "Join hub"}
                                    </button>
                                ) : (
                                    <span className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-fade bg-white/5 border border-white/10">
                                        Private
                                    </span>
                                )
                            )}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-fade">
                            <span className={`h-1.5 w-1.5 rounded-full ${hub.privacy_type === 'public' ? 'bg-green-500' : 'bg-fade'}`} />
                            <span className="capitalize">{hub.privacy_type}</span>
                            <span>·</span>
                            <span>Created {createdAt}</span>
                            {isOwner && (
                                <>
                                    <span>·</span>
                                    <span className="text-brand font-medium">You own this hub</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {joinError && (
                    <p className="mt-4 px-4 py-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg" role="alert">
                        {joinError}
                    </p>
                )}

                {hub.description && (
                    <p className="mt-6 pt-6 border-t border-white/5 text-sm text-dim leading-relaxed">
                        {hub.description}
                    </p>
                )}
            </div>

            <HubMembers slug={hub.slug} />
        </div>
    );
}
