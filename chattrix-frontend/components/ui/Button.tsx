import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
    primary: "bg-brand text-on-brand shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] hover:bg-brand-strong",
    secondary: "border border-control bg-surface text-ink hover:border-ink hover:bg-surface-muted",
    ghost: "text-muted hover:bg-surface-muted hover:text-ink",
    danger: "bg-danger text-on-danger shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)] hover:bg-danger-strong",
    "danger-soft": "border border-danger/40 bg-transparent text-danger-ink hover:bg-danger/8",
};

const SIZES: Record<Size, string> = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-sm gap-2",
};

/** Shared by `Button` and `ButtonLink`, and usable on its own for one-off elements. */
export function buttonClass(variant: Variant = "primary", size: Size = "md", fullWidth = false) {
    return `inline-flex items-center justify-center rounded-control font-medium motion-safe:transition active:translate-y-px disabled:pointer-events-none disabled:border-hairline disabled:bg-surface-muted disabled:text-muted disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    /** Disables the button and marks it busy, so a slow response can't become a double submit. */
    loading?: boolean;
};

export function Button({ variant, size, fullWidth, loading = false, disabled, className = "", type = "button", children, ...rest }: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`${buttonClass(variant, size, fullWidth)} ${className}`}
            {...rest}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
}

type ButtonLinkProps = {
    href: string;
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    className?: string;
    children: ReactNode;
};

export function ButtonLink({ href, variant, size, fullWidth, className = "", children }: ButtonLinkProps) {
    return (
        <Link href={href} className={`${buttonClass(variant, size, fullWidth)} ${className}`}>
            {children}
        </Link>
    );
}

export function Spinner({ className = "size-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} motion-safe:animate-spin`} fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

/** Inline text link: brand ink with an underline that draws in on hover. */
export const linkClass = "ink-link font-medium text-brand-ink motion-safe:transition-colors hover:text-brand-strong";
