"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addJoinedHub } from "@/lib/features/hubsSlice";
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

type Pagination = {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
};

export default function HubsPage() {
    const user = useAppSelector((state) => state.user.data);
    const joinedHubs = useAppSelector((state) => state.hubs.joined);
    const dispatch = useAppDispatch();

    const [hubs, setHubs] = useState<Hub[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<number | null>(null);
    const [locallyJoinedIds, setLocallyJoinedIds] = useState<number[]>([]);

    const handleJoin = async (e: React.MouseEvent, hub: Hub) => {
        e.preventDefault();
        e.stopPropagation();

        setJoiningId(hub.id);

        try {
            const response = await axios.post(`/api/hubs/${hub.slug}/join`);
            dispatch(addJoinedHub(response.data.data));
            setLocallyJoinedIds((ids) => [...ids, hub.id]);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setLocallyJoinedIds((ids) => [...ids, hub.id]);
            } else {
                console.error(error);
            }
        } finally {
            setJoiningId(null);
        }
    };

    useEffect(() => {
        const fetchHubs = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/hubs?page=${page}`);
                setHubs(response.data.data.hubs);
                setPagination(response.data.data.pagination);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchHubs();
    }, [page]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    All hubs{pagination ? <span className="text-dim font-normal"> · {pagination.total}</span> : null}
                </h1>
                <p className="mt-2 text-dim text-sm">Browse every hub on Chattrix.</p>
            </div>

            {loading ? (
                <div className="bg-overlay rounded-xl border border-white/5 divide-y divide-white/5 animate-pulse">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                            <div className="h-9 w-9 rounded-full bg-white/5 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 w-32 rounded bg-white/5" />
                            </div>
                            <div className="h-3 w-20 rounded bg-white/5" />
                        </div>
                    ))}
                </div>
            ) : hubs.length === 0 ? (
                <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
                    <p className="text-dim text-sm">No hubs yet. Be the first to create one.</p>
                    <Link
                        href="/hub/create"
                        className="mt-4 inline-block bg-brand hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Create your hub
                    </Link>
                </div>
            ) : (
                <div className="bg-overlay rounded-xl border border-white/5 divide-y divide-white/5">
                    {hubs.map((hub) => {
                        const isOwner = user?.id === hub.owner_id;
                        const isMember =
                            isOwner ||
                            joinedHubs.some((joined) => joined.id === hub.id) ||
                            locallyJoinedIds.includes(hub.id);

                        return (
                            <Link
                                key={hub.id}
                                href={`/hub/${hub.slug}`}
                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors"
                            >
                                <div className="h-9 w-9 rounded-full bg-surface ring-1 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                    {hub.avatar ? (
                                        <img src={assetUrl(hub.avatar)} alt={hub.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 flex items-baseline gap-2">
                                    <p className="font-medium truncate shrink-0">{hub.name}</p>
                                    <span className="text-xs px-1.5 py-0.5 rounded border border-white/10 text-fade capitalize shrink-0">
                                        {hub.privacy_type}
                                    </span>
                                    <span className="text-dim text-sm truncate hidden sm:inline">
                                        {hub.description || "No description yet."}
                                    </span>
                                </div>

                                <div className="shrink-0">
                                    {isOwner ? (
                                        <span className="text-xs text-brand font-medium">You own this</span>
                                    ) : isMember ? (
                                        <span className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-dim bg-white/5 border border-white/10">
                                            Joined
                                        </span>
                                    ) : hub.privacy_type === 'public' ? (
                                        <button
                                            type="button"
                                            onClick={(e) => handleJoin(e, hub)}
                                            disabled={joiningId === hub.id}
                                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay disabled:opacity-60 disabled:pointer-events-none transition-colors"
                                        >
                                            {joiningId === hub.id ? "Joining…" : "Join"}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-fade">Private</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.current_page <= 1}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-ink hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-fade">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                        disabled={pagination.current_page >= pagination.last_page}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-ink hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
