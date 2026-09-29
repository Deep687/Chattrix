import type { ReactNode } from "react";

const TONES = {
    brand: "border-brand/45 text-brand-ink",
    accent: "border-accent/60 text-accent-ink",
    muted: "border-control/50 text-muted",
    success: "border-success-ink/45 text-success-ink",
    danger: "border-danger/45 text-danger-ink",
};

/** A rubber-stamp label: outlined mono small caps, so status reads by word, not by fill colour. */
export default function Badge({ tone = "brand", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
    return (
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-[0.2rem] border px-1.5 py-px font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase ${TONES[tone]}`}>
            {children}
        </span>
    );
}
