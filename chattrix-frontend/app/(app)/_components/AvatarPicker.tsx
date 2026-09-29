"use client"
import { useId, type ChangeEvent, type ReactNode, type RefObject } from "react";
import Icon from "@/components/ui/Icon";

type AvatarPickerProps = {
    label: string;
    labelNote?: string;
    /** Object URL or asset URL to show; empty shows `fallback`. */
    preview: string;
    fallback: ReactNode;
    /** `round` for people, `square` for workspaces. */
    shape?: "round" | "square";
    file: File | null;
    inputRef?: RefObject<HTMLInputElement | null>;
    accept: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    chooseLabel: string;
    /** Shown only while a new file is chosen. */
    clearLabel?: string;
    onClear?: () => void;
    hint?: string;
    error?: string;
};

/**
 * Presentation only: validation, object URLs and upload stay with each form, which owns the
 * rules the server enforces. The whole tile is the file input's label, so it's one big target.
 */
export default function AvatarPicker({
    label,
    labelNote,
    preview,
    fallback,
    shape = "square",
    file,
    inputRef,
    accept,
    onChange,
    chooseLabel,
    clearLabel,
    onClear,
    hint = "JPG, PNG, WebP or GIF · up to 2 MB",
    error,
}: AvatarPickerProps) {
    const id = useId();
    const radius = shape === "round" ? "rounded-full" : "rounded-control";

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">
                {label}
                {labelNote && <span className="ms-1 font-normal text-muted">{labelNote}</span>}
            </span>

            <div
                className={`flex items-center gap-4 rounded-card border border-dashed bg-surface-muted/60 p-3 motion-safe:transition ${error ? "border-danger" : "border-control/60 hover:border-brand"}`}
            >
                <label htmlFor={id} className={`group relative size-16 shrink-0 cursor-pointer overflow-hidden bg-surface shadow-raise ring-1 ring-hairline ${radius}`}>
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="" className={`size-full object-cover ring-1 ring-hairline ${radius}`} />
                    ) : (
                        fallback
                    )}
                    <span
                        aria-hidden="true"
                        className={`absolute inset-0 flex items-center justify-center bg-scrim text-canvas opacity-0 dark:text-ink motion-safe:transition group-hover:opacity-100 ${radius}`}
                    >
                        <Icon name="upload" className="size-5" />
                    </span>
                </label>

                <div className="min-w-0 flex-1">
                    <input
                        ref={inputRef}
                        onChange={onChange}
                        id={id}
                        name="avatar"
                        type="file"
                        accept={accept}
                        aria-invalid={error ? true : undefined}
                        className="peer sr-only"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            htmlFor={id}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-control bg-surface px-2.5 py-1.5 text-xs font-medium text-ink motion-safe:transition hover:border-ink hover:bg-surface-muted peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
                        >
                            <Icon name="upload" className="size-3.5" />
                            {chooseLabel}
                        </label>

                        {file && onClear && clearLabel && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="rounded-control px-2 py-1.5 text-xs font-medium text-muted motion-safe:transition hover:bg-surface-muted hover:text-ink"
                            >
                                {clearLabel}
                            </button>
                        )}
                    </div>

                    <p className="mt-1.5 font-mono text-[0.6875rem] leading-relaxed text-muted">
                        {file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : hint}
                    </p>
                </div>
            </div>

            {error && <p className="text-xs font-medium text-danger-ink">{error}</p>}
        </div>
    );
}
