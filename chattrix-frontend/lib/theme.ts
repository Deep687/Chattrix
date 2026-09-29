export type ThemePreference = "system" | "light" | "dark";
export type BrandPalette = "indigo" | "azure" | "violet" | "slate";

export const PALETTES: { id: BrandPalette; label: string }[] = [
    { id: "indigo", label: "Indigo & Coral" },
    { id: "azure", label: "Azure & Amber" },
    { id: "violet", label: "Violet & Rose" },
    { id: "slate", label: "Slate & Cyan" },
];

const THEME_KEY = "chattrix.theme";
const PALETTE_KEY = "chattrix.palette";
const CHANGE_EVENT = "chattrix-appearance-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/*
 * Runs in <head> before first paint. The defaults (system, indigo) are stored as the *absence* of a
 * key, so returning to a default is the same state as never choosing. Hand-synced with the keys
 * above — it can't import them at runtime.
 */
export const THEME_SCRIPT = `(function(){try{var r=document.documentElement,t=localStorage.getItem("${THEME_KEY}"),p=localStorage.getItem("${PALETTE_KEY}");r.dataset.theme=t==="dark"||(t!=="light"&&matchMedia("${DARK_QUERY}").matches)?"dark":"light";if(p==="azure"||p==="violet"||p==="slate")r.dataset.palette=p}catch(e){}})()`;

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key: string, value: string | null) {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } catch {
        // Blocked storage: the choice still applies for this page view.
    }
}

export function currentTheme(): ThemePreference {
    const stored = read(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
}

export function currentPalette(): BrandPalette {
    const stored = read(PALETTE_KEY);
    return stored === "azure" || stored === "violet" || stored === "slate" ? stored : "indigo";
}

function apply() {
    const root = document.documentElement;
    const theme = currentTheme();
    const palette = currentPalette();

    root.dataset.theme = theme === "dark" || (theme === "system" && matchMedia(DARK_QUERY).matches) ? "dark" : "light";

    if (palette === "indigo") {
        delete root.dataset.palette;
    } else {
        root.dataset.palette = palette;
    }
}

/** Snapshot for `useSyncExternalStore`: a string, so React compares it by value. */
export function getAppearanceSnapshot(): string {
    return `${currentTheme()}:${currentPalette()}`;
}

export function getServerAppearanceSnapshot(): string {
    return "system:indigo";
}

/** Re-applies on OS theme changes (while on System) and on changes made in other tabs. */
export function subscribeToAppearance(onChange: () => void): () => void {
    const media = matchMedia(DARK_QUERY);

    const handleSystem = () => {
        if (currentTheme() === "system") {
            apply();
            onChange();
        }
    };

    const handleStorage = (event: StorageEvent) => {
        if (event.key !== THEME_KEY && event.key !== PALETTE_KEY) return;
        apply();
        onChange();
    };

    media.addEventListener("change", handleSystem);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(CHANGE_EVENT, onChange);

    return () => {
        media.removeEventListener("change", handleSystem);
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(CHANGE_EVENT, onChange);
    };
}

/**
 * The new look grows as a circle from `origin`. Without view transitions, or with reduced motion
 * requested, the switch is instant.
 */
function transition(update: () => void, origin?: { x: number; y: number }) {
    const run = () => {
        update();
        apply();
        window.dispatchEvent(new Event(CHANGE_EVENT));
    };

    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        run();
        return;
    }

    const style = document.documentElement.style;
    const x = origin?.x ?? innerWidth / 2;
    const y = origin?.y ?? 0;
    style.setProperty("--reveal-x", `${x}px`);
    style.setProperty("--reveal-y", `${y}px`);
    style.setProperty("--reveal-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);

    document.startViewTransition(run);
}

export function selectTheme(theme: ThemePreference, origin?: { x: number; y: number }) {
    transition(() => write(THEME_KEY, theme === "system" ? null : theme), origin);
}

export function selectPalette(palette: BrandPalette, origin?: { x: number; y: number }) {
    transition(() => write(PALETTE_KEY, palette === "indigo" ? null : palette), origin);
}
