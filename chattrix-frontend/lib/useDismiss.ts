import { useEffect, type RefObject } from "react";

/**
 * Closes a popover on Escape or on a press outside `ref`. A document listener rather than a
 * full-screen backdrop: the header's `backdrop-blur` makes it the containing block for fixed
 * children, so a `fixed inset-0` backdrop inside it only covered the header.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void) {
    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) onDismiss();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onDismiss();
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [ref, open, onDismiss]);
}
