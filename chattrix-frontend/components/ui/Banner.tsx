"use client"
import { trackPointer } from "@/lib/trackPointer";

/**
 * A notebook-ruled cover for identity cards (workspace, profile): faint lines, an accent margin
 * rule, and an oversized serif initial. On hover the lines glow around the pointer (`.ruled-live`).
 */
type BannerProps = {
    className?: string;
    initial?: string;
    /** False inside a `.spot-card`: the card sets `--spot-x/y` and the cover inherits them, so both lights move together. */
    track?: boolean;
};

export default function Banner({ className = "h-24", initial, track = true }: BannerProps) {
    return (
        <div aria-hidden="true" onPointerMove={track ? trackPointer : undefined} className={`ruled ruled-live overflow-hidden border-b border-hairline ${className}`}>
            {initial && (
                <span className="ruled-initial absolute -end-2 -bottom-10 font-serif text-[9rem] leading-none font-semibold italic select-none">
                    {initial.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}
