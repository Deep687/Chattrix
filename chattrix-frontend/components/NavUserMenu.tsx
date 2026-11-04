"use client"
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useDismiss } from "@/lib/useDismiss";
import UserAvatar from "./ui/UserAvatar";
import Icon, { type IconName } from "./ui/Icon";

type User = {
    name: string;
    email: string;
    avatar?: string;
};

const ITEMS: { label: string; href: string; icon: IconName }[] = [
    { label: "Workspaces", href: "/workspaces", icon: "workspace" },
    { label: "Profile", href: "/profile", icon: "user" },
];

export default function NavUserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [open, setOpen] = useState(false);

    const root = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useDismiss(root, open, close);

    const item = "flex items-center gap-3 rounded-control px-3 py-2 text-sm text-muted motion-safe:transition hover:bg-surface-muted hover:text-ink";

    return (
        <div ref={root} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-control py-1 ps-1 pe-2 motion-safe:transition hover:bg-surface-muted"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:block">{user.name}</span>
                <Icon name="chevron" className={`size-4 text-muted motion-safe:transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <>
                    <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-64 origin-top-right rounded-card border border-hairline bg-surface p-1.5 shadow-pop motion-safe:animate-sheet">
                        <div className="px-3 pt-3 pb-2.5">
                            <p className="eyebrow">Signed in as</p>
                            <p className="mt-1.5 truncate font-serif text-lg font-semibold text-ink">{user.name}</p>
                            <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>

                        <div className="mx-3 my-1 border-t border-hairline" />

                        {ITEMS.map((entry) => (
                            <Link key={entry.href} role="menuitem" href={entry.href} onClick={() => setOpen(false)} className={item}>
                                <Icon name={entry.icon} className="size-4" />
                                {entry.label}
                            </Link>
                        ))}

                        <div className="mx-3 my-1 border-t border-hairline" />

                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            className={`${item} w-full text-start`}
                        >
                            <Icon name="logout" className="size-4" />
                            Log out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
