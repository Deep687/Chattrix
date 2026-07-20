"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { assetUrl } from "@/lib/api";

type User = {
    name: string;
    email: string;
    avatar?: string;
};

export default function NavUserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <div className="h-7 w-7 rounded-full bg-surface ring-1 ring-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatar ? (
                        <img src={assetUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-ink">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <span className="hidden sm:block text-sm text-dim">{user.name}</span>
                <svg className={`h-3.5 w-3.5 text-fade transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-overlay border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-fade truncate">{user.email}</p>
                        </div>
                        <Link
                            href="/profile"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2.5 text-sm text-dim hover:text-ink hover:bg-white/5 transition-colors"
                        >
                            Profile
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-dim hover:text-ink hover:bg-white/5 transition-colors border-t border-white/5"
                        >
                            Log out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
