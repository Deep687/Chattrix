import type { ReactNode } from "react";

type AuthCardProps = {
    title: string;
    /** Mono small caps above the title, e.g. "Sign in". */
    eyebrow?: string;
    /** One sentence under the heading saying what the page is for. */
    description?: ReactNode;
    children: ReactNode;
};

/** A single sheet on the desk: double rule, serif title, one column of fields. */
export default function AuthCard({ title, eyebrow, description, children }: AuthCardProps) {
    return (
        <div className="m-auto w-full max-w-md motion-safe:animate-sheet">
            <div className="relative rounded-card border border-hairline bg-surface px-8 pt-10 pb-8 shadow-sheet">
                <span aria-hidden="true" className="rule-double absolute inset-x-8 top-4" />

                {eyebrow && <p className="eyebrow text-center">{eyebrow}</p>}
                <h1 className={`${eyebrow ? "mt-2" : ""} text-center font-serif text-[2rem] leading-tight font-semibold tracking-tight text-ink`}>{title}</h1>
                {description && <div className="mt-2 text-center text-sm text-pretty text-muted">{description}</div>}

                <div className="mt-8 flex flex-col gap-6">{children}</div>
            </div>
        </div>
    );
}
