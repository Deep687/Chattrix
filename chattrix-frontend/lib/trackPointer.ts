import type { PointerEvent } from "react";

/** Hands the pointer position within the element to CSS, which centres the spotlight on it. */
export function trackPointer(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
}
