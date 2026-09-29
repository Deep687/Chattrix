import type { ReactNode } from "react";

type SectionHeaderProps = {
    /** Section number, set in mono: "01". */
    number?: string;
    eyebrow: string;
    title: string;
    lead?: ReactNode;
    action?: ReactNode;
    /** `h1` for a page title, `h2` for a section within one. */
    as?: "h1" | "h2";
};

/** The editorial page/section head: "01 · EYEBROW", a serif title, a lead, and a rule under it. */
export default function SectionHeader({ number, eyebrow, title, lead, action, as: Heading = "h2" }: SectionHeaderProps) {
    return (
        <header className="motion-safe:animate-ink-fast">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="eyebrow">
                        {number && <span className="text-brand-ink">{number} · </span>}
                        {eyebrow}
                    </p>
                    <Heading className={`mt-2 font-serif font-semibold tracking-tight text-ink ${Heading === "h1" ? "text-4xl leading-[1.05] sm:text-[2.75rem]" : "text-2xl leading-tight"}`}>
                        {title}
                    </Heading>
                    {lead && <div className="mt-2 max-w-2xl text-pretty text-muted">{lead}</div>}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            <div aria-hidden="true" className="mt-5 border-t border-ink/80" />
        </header>
    );
}
