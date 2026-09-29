import type { ReactNode } from "react";

type StatusPageProps = {
    /** Set large in serif italic, like a folio number: "404". */
    code: string;
    eyebrow: string;
    title: string;
    children: ReactNode;
    actions: ReactNode;
};

/** Shared body for not-found and error pages: one sheet, one explanation, a way back. */
export default function StatusPage({ code, eyebrow, title, children, actions }: StatusPageProps) {
    return (
        <div className="m-auto w-full max-w-lg py-10 text-center motion-safe:animate-sheet">
            <p aria-hidden="true" className="font-serif text-8xl leading-none font-semibold text-brand-ink/25 italic">{code}</p>
            <p className="eyebrow mt-6">{eyebrow}</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight font-semibold tracking-tight text-ink">{title}</h1>
            <div aria-hidden="true" className="rule-double mx-auto mt-5 w-24" />
            <div className="mt-5 text-pretty text-muted">{children}</div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
        </div>
    );
}
