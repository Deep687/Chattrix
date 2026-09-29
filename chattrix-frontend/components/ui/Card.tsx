import type { ReactNode } from "react";

/** A sheet of paper: surface, hairline edge, a faint drop. */
export const cardClass = "relative rounded-card border border-hairline bg-surface shadow-card";

type CardProps = {
    children: ReactNode;
    className?: string;
    /** Opens the card with the typographic double rule. `accentEdge` is the old name, kept as an alias. */
    ruled?: boolean;
    accentEdge?: boolean;
    /** Adds the second sheet peeking out underneath, for the page's one most important card. */
    stacked?: boolean;
    as?: "section" | "div" | "article";
};

export default function Card({ children, className = "", ruled = false, accentEdge = false, stacked = false, as: Tag = "section" }: CardProps) {
    return (
        <Tag className={`${cardClass} ${stacked ? "shadow-sheet" : ""} ${className}`}>
            {(ruled || accentEdge) && <span aria-hidden="true" className="rule-double absolute inset-x-5 top-3" />}
            {children}
        </Tag>
    );
}
