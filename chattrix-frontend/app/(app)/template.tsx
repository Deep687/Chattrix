import type { ReactNode } from "react";

/** A template, not a layout: it remounts per route, which replays the entrance. */
export default function AppTemplate({ children }: { children: ReactNode }) {
    return <div className="motion-safe:animate-ink-fast">{children}</div>;
}
