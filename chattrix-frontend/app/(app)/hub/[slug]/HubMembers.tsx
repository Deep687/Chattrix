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
        <div className="bg-overlay rounded-xl border border-white/5 p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">Members</h2>
                {!loading && <span className="text-xs text-fade">{members.length} total</span>}
            </div>

            {loading ? (
                <p className="mt-4 text-dim text-sm">Loading members…</p>
            ) : members.length === 0 ? (
                <p className="mt-4 text-dim text-sm">No members yet.</p>
            ) : (
                <ul className="mt-4 space-y-1">
                    {members.map((member) => (
                        <li
                            key={member.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <div className="h-9 w-9 rounded-full bg-surface ring-1 ring-white/5 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-ink">
                                    {member.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{member.name}</p>
                                <p className="text-xs text-fade truncate">{member.email}</p>
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
