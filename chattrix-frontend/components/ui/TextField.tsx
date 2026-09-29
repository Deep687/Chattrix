"use client"
import { useId, useState, type ChangeEvent, type ReactNode } from "react";

type TextFieldProps = {
    /** Also the key its Laravel validation error arrives under. */
    name: string;
    label: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: "text" | "email" | "password";
    /** Renders a textarea with this many rows. */
    rows?: number;
    error?: string;
    hint?: string;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    autoFocus?: boolean;
    maxLength?: number;
    /** Sits at the end of the label row — a "Forgot password?" link, say. A sibling of the label, so they don't share a click target. */
    labelAction?: ReactNode;
    /** Appended to the label in muted text, e.g. "(optional)". */
    labelNote?: string;
};

/**
 * Labelled input with hint and error wired through `aria-describedby`, so a screen reader
 * announces the requirement and the failure with the field. Passwords get a reveal control that
 * starts hidden every time.
 */
export default function TextField({
    name,
    label,
    value,
    onChange,
    type = "text",
    rows,
    error,
    hint,
    placeholder,
    autoComplete,
    required = false,
    autoFocus = false,
    maxLength,
    labelAction,
    labelNote,
}: TextFieldProps) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

    const [revealed, setRevealed] = useState(false);
    const revealable = type === "password";

    const control = `w-full rounded-control border border-control bg-surface py-2.5 ps-3.5 text-sm text-ink placeholder:font-serif placeholder:italic placeholder:text-muted motion-safe:transition focus:border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-ring aria-invalid:border-danger ${revealable ? "pe-11" : "pe-3.5"}`;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium text-ink">
                    {label}
                    {labelNote && <span className="ms-1 font-normal text-muted">{labelNote}</span>}
                </label>
                {labelAction}
            </div>

            <div className="relative flex">
                {rows ? (
                    <textarea
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        rows={rows}
                        placeholder={placeholder}
                        required={required}
                        maxLength={maxLength}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={describedBy}
                        className={`${control} resize-none`}
                    />
                ) : (
                    <input
                        id={id}
                        name={name}
                        type={revealable && revealed ? "text" : type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        required={required}
                        autoFocus={autoFocus}
                        maxLength={maxLength}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={describedBy}
                        className={control}
                    />
                )}

                {revealable && (
                    <button
                        type="button"
                        onClick={() => setRevealed((shown) => !shown)}
                        aria-label={`${revealed ? "Hide" : "Show"} ${label}`}
                        aria-controls={id}
                        className="absolute inset-y-0 end-0 flex items-center px-3 text-muted motion-safe:transition hover:text-ink"
                    >
                        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 stroke-current" fill="none" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 10S4.9 4.5 10 4.5 18.5 10 18.5 10 15.1 15.5 10 15.5 1.5 10 1.5 10Z" />
                            <circle cx="10" cy="10" r="2.6" />
                            {revealed && <path strokeLinecap="round" d="M3.6 3.6 16.4 16.4" />}
                        </svg>
                    </button>
                )}
            </div>

            {hint && <p id={hintId} className="text-xs text-muted">{hint}</p>}
            {error && <p id={errorId} className="text-xs font-medium text-danger-ink">{error}</p>}
        </div>
    );
}
