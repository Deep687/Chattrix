"use client"
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import SegmentedChoice from "@/components/ui/SegmentedChoice";
import { useDismiss } from "@/lib/useDismiss";
import Icon from "@/components/ui/Icon";
import {
    PALETTES,
    getAppearanceSnapshot,
    getServerAppearanceSnapshot,
    selectPalette,
    selectTheme,
    subscribeToAppearance,
    type BrandPalette,
    type ThemePreference,
} from "@/lib/theme";

/* Literal map so Tailwind's scanner sees each class. */
const SWATCH: Record<BrandPalette, string> = {
    indigo: "bg-swatch-indigo",
    azure: "bg-swatch-azure",
    violet: "bg-swatch-violet",
    slate: "bg-swatch-slate",
};

function useAppearance(): { theme: ThemePreference; palette: BrandPalette } {
    const snapshot = useSyncExternalStore(subscribeToAppearance, getAppearanceSnapshot, getServerAppearanceSnapshot);
    const [theme, palette] = snapshot.split(":");
    return { theme: theme as ThemePreference, palette: palette as BrandPalette };
}

/**
 * The one place appearance is chosen: a header button opening theme + palette. Palettes are a
 * named list with a check, so selection never depends on telling hues apart.
 */
export default function AppearanceMenu() {
    const [open, setOpen] = useState(false);
    const { theme, palette } = useAppearance();

    const root = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useDismiss(root, open, close);

    return (
        <div ref={root} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Appearance"
                aria-expanded={open}
                className="inline-flex h-9 items-center gap-2 rounded-control px-2.5 text-muted motion-safe:transition hover:bg-surface-muted hover:text-ink"
            >
                <span aria-hidden="true" className={`size-3.5 rounded-full ring-2 ring-surface outline outline-1 outline-control ${SWATCH[palette]}`} />
                <span className="hidden font-mono text-[0.6875rem] tracking-[0.12em] uppercase lg:inline">Appearance</span>
            </button>

            {open && (
                <>
                    <div className="absolute end-0 top-full z-50 mt-2 w-72 origin-top-right rounded-card border border-hairline bg-surface p-4 shadow-pop motion-safe:animate-sheet">
                        <span aria-hidden="true" className="rule-double absolute inset-x-4 top-2.5" />

                        <p className="eyebrow mt-2">Theme</p>
                        <div className="mt-2">
                            <SegmentedChoice
                                name="theme"
                                legend="Theme"
                                value={theme}
                                onChange={selectTheme}
                                optionClassName="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[0.25rem] px-2 text-xs font-medium text-muted peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring motion-safe:transition hover:text-ink peer-checked:hover:text-canvas"
                                options={[
                                    { value: "light", label: "Light", content: <span aria-hidden="true">Light</span> },
                                    { value: "dark", label: "Dark", content: <span aria-hidden="true">Dark</span> },
                                    { value: "system", label: "Match system", content: <span aria-hidden="true">Auto</span> },
                                ]}
                            />
                        </div>

                        <p className="eyebrow mt-5">Palette</p>
                        <fieldset className="mt-1.5">
                            <legend className="sr-only">Colour palette</legend>
                            <ul className="flex flex-col">
                                {PALETTES.map((p) => {
                                    const active = palette === p.id;
                                    return (
                                        <li key={p.id}>
                                            <label className="group flex cursor-pointer items-center gap-3 rounded-control px-2 py-2 motion-safe:transition hover:bg-surface-muted has-focus-visible:outline-2 has-focus-visible:outline-ring">
                                                <input
                                                    type="radio"
                                                    name="palette-menu"
                                                    value={p.id}
                                                    checked={active}
                                                    onChange={(e) => {
                                                        const box = e.currentTarget.getBoundingClientRect();
                                                        selectPalette(p.id, { x: box.left, y: box.top });
                                                    }}
                                                    className="sr-only"
                                                />
                                                <span aria-hidden="true" className={`size-4 rounded-full ${SWATCH[p.id]}`} />
                                                <span className={`flex-1 text-sm ${active ? "font-semibold text-ink" : "text-muted group-hover:text-ink"}`}>{p.label}</span>
                                                {active && <Icon name="check" className="size-4 text-brand-ink" />}
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </fieldset>
                    </div>
                </>
            )}
        </div>
    );
}
