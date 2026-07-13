"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
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
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

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
                <h1 className="text-2xl font-bold tracking-tight">All hubs</h1>
                <p className="mt-2 text-dim text-sm">Browse every community on Chattrix.</p>
            </div>

            {loading ? (
                <p className="text-dim text-sm">Loading hubs…</p>
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
                <ul className="space-y-3">
                    {hubs.map((hub) => (
                        <li key={hub.id}>
                            <Link
                                href={`/hub/${hub.slug}`}
                                className="flex items-center gap-4 bg-overlay rounded-xl border border-white/5 px-5 py-4 hover:border-white/10 transition-colors"
                            >
                                <div className="h-11 w-11 rounded-full bg-surface overflow-hidden flex items-center justify-center shrink-0">
                                    {hub.avatar ? (
                                        <img src={assetUrl(hub.avatar)} alt={hub.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-medium truncate">{hub.name}</p>
                                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full border border-white/10 text-fade capitalize">
                                            {hub.privacy_type}
                                        </span>
                                    </div>
                                    {hub.description && (
                                        <p className="text-dim text-sm mt-1 line-clamp-2">{hub.description}</p>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
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
