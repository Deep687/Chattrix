"use client"
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { assetUrl } from "@/lib/api";

const NAV_ITEMS = [
    {
        label: "Home",
        href: "/dashboard",
        icon: (
            <path d="M10 2.5a1 1 0 01.6.2l7 5.25a1 1 0 01.4.8V16a1.5 1.5 0 01-1.5 1.5h-3.75a.75.75 0 01-.75-.75V13a1 1 0 00-1-1H9a1 1 0 00-1 1v3.75a.75.75 0 01-.75.75H3.5A1.5 1.5 0 012 16V8.75a1 1 0 01.4-.8l7-5.25a1 1 0 01.6-.2z" />
        ),
    },
    {
        label: "All",
        href: "/hubs",
        icon: (
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        ),
    },
];

function SidebarContent({ pathname, myHubs }: { pathname: string; myHubs: { id: number; slug: string; name: string; avatar: string | null }[] }) {
    return (
        <aside className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === item.href
                        ? "bg-brand/10 text-ink font-medium"
                        : "text-dim hover:bg-white/5 hover:text-ink"
                        }`}
                >
                    <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        {item.icon}
                    </svg>
                    {item.label}
                </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between px-3 mb-2">
                    <p className="text-xs font-semibold text-fade uppercase tracking-wider">
                        My Hubs
                    </p>
                    <Link
                        href="/hub/create"
                        title="Create a hub"
                        aria-label="Create a hub"
                        className="h-5 w-5 flex items-center justify-center rounded text-fade hover:text-brand hover:bg-brand/10 transition-colors"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
                {myHubs.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                        {myHubs.map((hub) => (
                            <Link
                                key={hub.id}
                                href={`/hub/${hub.slug}`}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === `/hub/${hub.slug}`
                                    ? "bg-brand/10 text-ink font-medium"
                                    : "text-dim hover:bg-white/5 hover:text-ink"
                                    }`}
                            >
                                <div className="h-6 w-6 rounded-full bg-surface ring-1 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                    {hub.avatar ? (
                                        <img src={assetUrl(hub.avatar)} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <span className="truncate">{hub.name}</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="px-3 text-xs text-fade leading-relaxed">
                        None yet — <Link href="/hubs" className="text-dim hover:text-ink underline underline-offset-2">browse hubs</Link> or{" "}
                        <Link href="/hub/create" className="text-dim hover:text-ink underline underline-offset-2">create one</Link>.
                    </p>
                )}
            </div>
        </aside>
    );
}

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const { owned, joined } = useAppSelector((state) => state.hubs);
    const myHubs = [...owned, ...joined];

    useEffect(() => {
        if (!mobileOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [mobileOpen, onClose]);

    return (
        <>
            <div className="hidden md:block shrink-0 w-60">
                <div className="sticky top-20 bg-overlay rounded-xl border border-white/5 p-3">
                    <SidebarContent pathname={pathname} myHubs={myHubs} />
                </div>
            </div>

            <div
                className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                aria-hidden={!mobileOpen}
            >
                <div
                    onClick={onClose}
                    className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
                />

                <div
                    className={`absolute left-0 top-0 h-full w-full max-w-xs bg-overlay border-r border-white/5 shadow-2xl transition-transform overflow-y-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <span className="text-sm font-bold tracking-tight">Menu</span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-dim hover:text-ink hover:bg-white/5 transition-colors"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-3">
                        <SidebarContent pathname={pathname} myHubs={myHubs} />
                    </div>
                </div>
            </div>
        </>
    );
}
