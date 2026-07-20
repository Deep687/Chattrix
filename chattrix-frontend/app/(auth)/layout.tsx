import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen bg-surface text-ink flex items-center justify-center px-4 overflow-hidden">
            <div
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)" }}
                aria-hidden="true"
            />
            <div className="relative w-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
