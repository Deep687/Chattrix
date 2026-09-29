import type { ReactNode } from "react";

const TONES = {
    info: { box: "border-accent text-ink", label: "Note", labelClass: "text-accent-ink" },
    success: { box: "border-success-ink text-ink", label: "Done", labelClass: "text-success-ink" },
    error: { box: "border-danger text-danger-ink", label: "Error", labelClass: "text-danger-ink" },
};

/**
 * A margin note: a rule down the side and a small-caps label, so the tone reads by word as well as
 * colour. Errors interrupt (`role="alert"`); the rest are announced politely.
 */
export default function Alert({ tone = "info", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
    const t = TONES[tone];

    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex gap-3 border-s-2 bg-surface-muted/60 py-2.5 ps-3.5 pe-3 text-sm motion-safe:animate-ink-fast ${t.box}`}
        >
            <span className={`eyebrow shrink-0 pt-0.5 ${t.labelClass}`}>{t.label}</span>
            <div className="font-medium">{children}</div>
        </div>
    );
}
