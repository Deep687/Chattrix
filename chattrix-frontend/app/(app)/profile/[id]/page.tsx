"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { assetUrl } from "@/lib/api";

type PublicUser = {
    id: number;
    name: string;
    avatar: string | null;
    created_at: string;
};

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
            <div className="max-w-md mx-auto">
                <div className="bg-overlay rounded-xl border border-white/5 p-8 flex flex-col items-center animate-pulse">
                    <div className="h-20 w-20 rounded-full bg-white/5" />
                    <div className="mt-3 h-5 w-32 rounded bg-white/5" />
                    <div className="mt-2 h-3 w-24 rounded bg-white/5" />
                </div>
            </div>
        );
    }

    if (notFound || !user) {
        return (
            <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
                <p className="text-xl font-bold mb-2">User not found</p>
                <p className="text-dim text-sm">This user doesn&apos;t exist.</p>
            </div>
        );
    }

    const memberSince = new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-overlay rounded-xl border border-white/5 p-8 flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-surface ring-2 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatar ? (
                        <img src={assetUrl(user.avatar)} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-ink">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <h1 className="mt-3 text-xl font-bold tracking-tight">{user.name}</h1>
                <p className="mt-3 text-xs text-fade">Member since {memberSince}</p>
            </div>
        </div>
    );
}
