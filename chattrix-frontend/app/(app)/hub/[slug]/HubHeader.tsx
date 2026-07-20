"use client"
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

export default function HubHeader({
    hub,
    isOwner,
    isMember,
    joining,
    joinError,
    onJoin,
    onOpenInfo,
}: {
    hub: Hub;
    isOwner: boolean;
    isMember: boolean;
    joining: boolean;
    joinError: string;
    onJoin: () => void;
    onOpenInfo: () => void;
}) {
    return (
        <div className="bg-overlay rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onOpenInfo}
                    className="min-w-0 flex-1 flex items-center gap-4 text-left rounded-lg p-1 -m-1 hover:bg-white/5 transition-colors"
                >
                    <div className="h-11 w-11 rounded-full bg-surface ring-2 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {hub.avatar ? (
                            <img
                                src={assetUrl(hub.avatar)}
                                alt={hub.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-base font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-lg font-bold tracking-tight truncate">{hub.name}</h1>
                        <div className="flex items-center gap-1.5 text-xs text-fade">
                            <span className={`h-1.5 w-1.5 rounded-full ${hub.privacy_type === 'public' ? 'bg-green-500' : 'bg-fade'}`} />
                            <span className="capitalize">{hub.privacy_type}</span>
                        </div>
                    </div>
                </button>

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
                            onClick={onJoin}
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

            {joinError && (
                <p className="mt-4 px-4 py-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg" role="alert">
                    {joinError}
                </p>
            )}
        </div>
    );
}
