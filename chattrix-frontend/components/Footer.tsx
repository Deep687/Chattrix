/** A colophon rather than a footer: the product's one promise, set small. */
export default function Footer() {
    return (
        <footer className="border-t border-hairline">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-baseline justify-between gap-3 px-4 py-6 sm:px-6">
                <p className="eyebrow">© {new Date().getFullYear()} Chattrix</p>
                <p className="font-serif text-sm text-muted italic">
                    Every workspace is isolated. Answers never cross companies.
                </p>
            </div>
        </footer>
    );
}
