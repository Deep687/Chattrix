"use client"
import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "./Icon";

type DialogProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    /** Danger sets the opening rule in red, so a destructive dialog reads as one before it's read. */
    tone?: "default" | "danger";
    children: ReactNode;
};

/**
 * Modal shell: backdrop, raised panel, Escape and backdrop-click to close, scroll lock, and focus
 * moved in on open and back to the trigger on close.
 */
export default function Dialog({ open, onClose, title, description, tone = "default", children }: DialogProps) {
    const titleId = useId();
    const panel = useRef<HTMLDivElement>(null);
    // In a ref so an inline `onClose` doesn't re-run the effect and steal focus on every render.
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) return;

        const trigger = document.activeElement as HTMLElement | null;
        const first = panel.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-dialog-close])");
        first?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCloseRef.current();
        };

        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener("keydown", handleKeyDown);
            trigger?.focus();
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <div
                aria-hidden="true"
                onClick={onClose}
                className="absolute inset-0 bg-scrim motion-safe:animate-fade-in"
            />

            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-card border border-hairline bg-surface px-7 pt-9 pb-7 shadow-pop motion-safe:animate-sheet"
            >
                <span
                    aria-hidden="true"
                    className={`absolute inset-x-7 top-3.5 ${tone === "danger" ? "border-t-[3px] border-double border-danger" : "rule-double"}`}
                />

                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 id={titleId} className="font-serif text-2xl leading-tight font-semibold tracking-tight text-ink">{title}</h2>
                        {description && <div className="mt-1.5 text-sm text-pretty text-muted">{description}</div>}
                    </div>

                    <button
                        type="button"
                        data-dialog-close
                        onClick={onClose}
                        aria-label="Close"
                        className="-me-2 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-muted motion-safe:transition hover:bg-surface-muted hover:text-ink"
                    >
                        <Icon name="close" className="size-4" />
                    </button>
                </div>

                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}
