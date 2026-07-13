"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function HubDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const user = useAppSelector((state) => state.user.data);

    const [hub, setHub] = useState<Hub | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

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
                        <h1 className="text-2xl font-bold tracking-tight truncate">{hub.name}</h1>
                        <p className="mt-0.5 text-dim text-sm">/h/{hub.slug}</p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-fade">
                            <span className={`h-1.5 w-1.5 rounded-full ${hub.privacy_type === 'public' ? 'bg-green-500' : 'bg-fade'}`} />
                            <span className="capitalize">{hub.privacy_type}</span>
                            <span>·</span>
                            <span>Created {createdAt}</span>
                            {user?.id === hub.owner_id && (
                                <>
                                    <span>·</span>
                                    <span className="text-brand font-medium">You own this hub</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {hub.description && (
                    <p className="mt-6 pt-6 border-t border-white/5 text-sm text-dim leading-relaxed">
                        {hub.description}
                    </p>
                )}
            </div>
        </div>
    );
}
