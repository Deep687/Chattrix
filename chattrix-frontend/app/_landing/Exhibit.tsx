/** Static illustration of a grounded answer, set as a paper exhibit. Not live data. */
export default function Exhibit() {
    return (
        <figure aria-label="Example of a cited answer" className="relative rounded-card border border-hairline bg-surface px-6 pt-9 pb-6 shadow-sheet motion-safe:animate-sheet motion-safe:[animation-delay:250ms] sm:px-8">
            <span aria-hidden="true" className="rule-double absolute inset-x-6 top-3.5 sm:inset-x-8" />

            <div className="flex items-baseline justify-between gap-3">
                <p className="eyebrow">Exhibit A · Acme workspace</p>
                <p className="eyebrow hidden sm:block">4 documents</p>
            </div>

            <p className="mt-5 text-sm text-muted">
                <span className="eyebrow me-2 text-brand-ink">Q.</span>
                How many casual leaves do I get?
            </p>

            <p className="mt-3 font-serif text-xl leading-snug text-ink sm:text-[1.375rem]">
                <span className="eyebrow me-2 align-middle text-brand-ink">A.</span>
                You get <strong className="font-semibold">12 casual leaves</strong> per calendar year, credited on 1 January.<span className="footnote">1</span>{" "}
                Unused casual leave does not carry over.<span className="footnote">2</span>
            </p>

            <div aria-hidden="true" className="mt-5 w-16 border-t border-ink" />
            <ol className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted">
                <li className="flex gap-2">
                    <span className="font-mono text-brand-ink">1</span>
                    <span><span className="font-mono">acme-hr-handbook.pdf · p.4</span> — <span className="font-serif italic">“…entitled to twelve (12) days of casual leave per calendar year…”</span></span>
                </li>
                <li className="flex gap-2">
                    <span className="font-mono text-brand-ink">2</span>
                    <span><span className="font-mono">acme-hr-handbook.pdf · p.5</span> — <span className="font-serif italic">“…casual leave lapses at year end.”</span></span>
                </li>
            </ol>

            <div className="mt-6 border-t border-dashed border-control/60 pt-4">
                <p className="text-sm text-muted">
                    <span className="eyebrow me-2 text-brand-ink">Q.</span>
                    What&apos;s Globex&apos;s remote-work stipend?
                </p>
                <p className="mt-2 font-serif text-lg text-ink italic">
                    <span className="eyebrow me-2 not-italic text-accent-ink">A.</span>
                    I don&apos;t know based on Acme&apos;s documents.
                </p>
            </div>
        </figure>
    );
}
