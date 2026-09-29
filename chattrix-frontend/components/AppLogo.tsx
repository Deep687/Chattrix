import Link from "next/link";

/** Serif wordmark with a footnote marker: the product's promise that every answer is cited. */
export default function AppLogo({ href = "/" }: { href?: string }) {
    return (
        <Link href={href} className="group inline-flex items-baseline rounded-control">
            <span className="font-serif text-[1.45rem] leading-none font-semibold tracking-tight text-ink">Chattrix</span>
            <span aria-hidden="true" className="footnote motion-safe:transition-colors group-hover:bg-brand group-hover:text-on-brand">1</span>
        </Link>
    );
}
