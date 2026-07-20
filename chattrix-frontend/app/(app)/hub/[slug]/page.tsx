"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addJoinedHub } from "@/lib/features/hubsSlice";
import HubHeader from "./HubHeader";
import HubInfoPanel from "./HubInfoPanel";
import PostsFeed from "./PostsFeed";

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
    const [infoOpen, setInfoOpen] = useState(false);

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
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-overlay rounded-xl border border-white/5 p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-white/5 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 rounded bg-white/5" />
                            <div className="h-3 w-16 rounded bg-white/5" />
                        </div>
                    </div>
                </div>
                <div className="bg-overlay rounded-xl border border-white/5 p-8 h-40" />
            </div>
        );
    }

    if (notFound || !hub) {
        return (
            <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
                <p className="text-xl font-bold mb-2">Hub not found</p>
                <p className="text-dim text-sm">This hub doesn&apos;t exist or you don&apos;t have access to it.</p>
            </div>
        );
    }

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
            <HubHeader
                hub={hub}
                isOwner={isOwner}
                isMember={isMember}
                joining={joining}
                joinError={joinError}
                onJoin={handleJoin}
                onOpenInfo={() => setInfoOpen(true)}
            />

            <PostsFeed slug={hub.slug} />

            <HubInfoPanel
                hub={hub}
                isOwner={isOwner}
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
            />
        </div>
    );
}
