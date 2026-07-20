"use client"
import { useEffect, useState } from "react";
import axios from "axios";

type Member = {
    id: number;
    name: string;
    email: string;
    is_owner: boolean;
    joined_at: string;
};

export default function HubMembers({ slug }: { slug: string }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);

            try {
                const response = await axios.get(`/api/hubs/${slug}/members`);
                setMembers(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [slug]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-fade uppercase tracking-wider">Members</p>
                {!loading && <span className="text-xs text-fade">{members.length}</span>}
            </div>

            {loading ? (
                <ul className="mt-2 -mx-2 animate-pulse">
                    {[0, 1, 2].map((i) => (
                        <li key={i} className="flex items-center gap-3 px-2 py-2.5">
                            <div className="h-9 w-9 rounded-full bg-white/5 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-24 rounded bg-white/5" />
                                <div className="h-2.5 w-32 rounded bg-white/5" />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : members.length === 0 ? (
                <p className="mt-3 text-dim text-sm">No members yet.</p>
            ) : (
                <ul className="mt-2 -mx-2">
                    {members.map((member) => (
                        <li
                            key={member.id}
                            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <div className="h-9 w-9 rounded-full bg-surface ring-1 ring-white/5 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-ink">
                                    {member.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{member.name}</p>
                                {member.email !== member.name && (
                                    <p className="text-xs text-fade truncate">{member.email}</p>
                                )}
                            </div>
                            {member.is_owner && (
                                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">
                                    Owner
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
