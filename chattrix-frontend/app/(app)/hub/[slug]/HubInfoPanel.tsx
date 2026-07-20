"use client"
import { useEffect } from "react";
import Link from "next/link";
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

export default function HubInfoPanel({
    hub,
    isOwner,
    open,
    onClose,
}: {
    hub: Hub;
    isOwner: boolean;
    open: boolean;
    onClose: () => void;
}) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    const createdAt = new Date(hub.created_at).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div
            className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
            />

            <div
                className={`absolute right-0 top-0 h-full w-full max-w-sm bg-overlay border-l border-white/5 shadow-2xl transition-transform overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-sm font-bold tracking-tight">Hub info</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close hub info"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-dim hover:text-ink hover:bg-white/5 transition-colors"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-8 flex flex-col items-center text-center border-b border-white/5">
                    <div className="h-20 w-20 rounded-full bg-surface ring-2 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {hub.avatar ? (
                            <img
                                src={assetUrl(hub.avatar)}
                                alt={hub.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <h1 className="mt-3 text-xl font-bold tracking-tight">{hub.name}</h1>
                    <p className="text-dim text-sm">/h/{hub.slug}</p>

                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-fade">
                        <span className={`h-1.5 w-1.5 rounded-full ${hub.privacy_type === 'public' ? 'bg-green-500' : 'bg-fade'}`} />
                        <span className="capitalize">{hub.privacy_type}</span>
                        <span>·</span>
                        <span>Created {createdAt}</span>
                    </div>

                    {isOwner && (
                        <Link
                            href={`/hub/${hub.slug}/edit`}
                            className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-ink bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        >
                            Edit hub
                        </Link>
                    )}
                </div>

                {hub.description && (
                    <div className="px-6 py-5 border-b border-white/5">
                        <p className="text-xs font-semibold text-fade uppercase tracking-wider mb-2">About</p>
                        <p className="text-sm text-dim leading-relaxed">{hub.description}</p>
                    </div>
                )}

                <div className="px-6 py-5">
                    <HubMembers slug={hub.slug} />
                </div>
            </div>
        </div>
    );
}
