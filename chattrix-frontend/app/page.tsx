"use client"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ButtonLink } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useAppSelector } from "@/lib/hooks";
import Exhibit from "./_landing/Exhibit";

const STEPS: { title: string; body: string }[] = [
    { title: "Upload policies", body: "The HR handbook, IT and security policy, leave and benefits." },
    { title: "Indexed per workspace", body: "Every passage is stamped with the company it belongs to." },
    { title: "Ask in plain English", body: "No keywords, no digging through a forty-page PDF." },
    { title: "Read a cited answer", body: "Each claim carries a footnote to its source passage." },
];

const FEATURES: { title: string; body: string }[] = [
    { title: "Every answer cited", body: "Footnotes sit right after the claim they support, with the file, the page and the quoted passage. Nobody has to take an answer on trust." },
    { title: "Honest “I don't know”", body: "When the answer isn't in your documents, Chattrix says so plainly instead of guessing." },
    { title: "One workspace per company", body: "Each company's documents, members and answers live in their own workspace, and stay there." },
    { title: "Owners and members", body: "Owners curate the documents and the people. Members ask and upload. Nothing more." },
    { title: "Invite-only access", body: "No public workspaces, no domain auto-join. You're in because someone invited you." },
    { title: "Answers in seconds", body: "Faster than finding the right page of the handbook, and nobody in HR gets pinged." },
];

const SAFEGUARDS = [
    "Retrieval is filtered by workspace before the search runs.",
    "Platform admins have no bypass into tenant documents.",
    "Invites are hashed, expiring, single-use tokens.",
    "Every answer is traceable to its source passage.",
];

/** Public front page, set like a report's front page. Reads only the session user, never tenant data. */
export default function Home() {
    const user = useAppSelector((state) => state.user.data);

    return (
        <div className="flex min-h-dvh flex-col text-ink">
            <Navbar />

            <main id="main-content" className="mx-auto w-full max-w-7xl grow px-4 sm:px-6">
                {/* Masthead dateline */}
                <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink pb-2 motion-safe:animate-ink-fast">
                    <p className="eyebrow text-ink">Vol. 1 · Internal policy assistant</p>
                    <p className="eyebrow hidden sm:block">Private per company · Cited every time</p>
                </div>
                <div aria-hidden="true" className="mt-0.5 border-t border-hairline" />

                <section aria-labelledby="hero-heading" className="grid items-start gap-12 py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-16">
                    <div>
                        <h1
                            id="hero-heading"
                            className="font-serif text-[2.75rem] leading-[1.02] font-semibold tracking-tight text-ink motion-safe:animate-ink sm:text-6xl lg:text-7xl"
                        >
                            Your company&apos;s policies, answered <em className="font-normal text-brand-ink">with sources.</em>
                        </h1>

                        <p className="mt-8 max-w-xl text-lg leading-relaxed text-pretty text-muted motion-safe:animate-ink motion-safe:[animation-delay:120ms] first-letter:float-left first-letter:me-2 first-letter:font-serif first-letter:text-[3.6rem] first-letter:leading-[0.85] first-letter:font-semibold first-letter:text-ink">
                            Employees ask in plain English. Chattrix answers from your own handbooks and policies, and
                            footnotes the exact passage each answer came from. When the documents don&apos;t say, it
                            says so.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-3 motion-safe:animate-ink motion-safe:[animation-delay:220ms]">
                            {user ? (
                                <ButtonLink href="/dashboard" size="lg">Open Chattrix →</ButtonLink>
                            ) : (
                                <>
                                    <ButtonLink href="/signup" size="lg">Get started →</ButtonLink>
                                    <ButtonLink href="/login" variant="secondary" size="lg">Log in</ButtonLink>
                                </>
                            )}
                        </div>
                    </div>

                    <Exhibit />
                </section>

                <section aria-labelledby="how-heading" className="border-t-[3px] border-double border-ink py-14">
                    <Reveal>
                        <p className="eyebrow"><span className="text-brand-ink">01 · </span>Method</p>
                        <h2 id="how-heading" className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            How it works
                        </h2>
                    </Reveal>

                    <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, i) => (
                            <li key={step.title}>
                                <Reveal delay={i * 120}>
                                    <div aria-hidden="true" className="rule-line border-t border-ink" />
                                    <p className="mt-4 font-serif text-5xl leading-none font-semibold text-brand-ink italic">
                                        {String(i + 1).padStart(2, "0")}
                                    </p>
                                    <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                                    <p className="mt-1.5 text-sm text-pretty text-muted">{step.body}</p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </section>

                <section aria-labelledby="features-heading" className="border-t border-ink py-14">
                    <Reveal>
                        <p className="eyebrow"><span className="text-brand-ink">02 · </span>What employees get</p>
                        <h2 id="features-heading" className="mt-2 max-w-2xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            Answers people can act on, <em className="font-normal">not guesses.</em>
                        </h2>
                    </Reveal>

                    <div className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-hairline">
                        {[0, 1, 2].map((col) => (
                            <div key={col} className="lg:px-8 lg:first:ps-0 lg:last:pe-0">
                                {FEATURES.filter((_, i) => i % 3 === col).map((f, j) => (
                                    <Reveal key={f.title} delay={col * 100 + j * 80} className="mb-8">
                                        <h3 className="eyebrow text-ink">{f.title}</h3>
                                        <p className="mt-2 font-serif text-lg leading-relaxed text-pretty text-muted">{f.body}</p>
                                    </Reveal>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="trust-heading" className="border-t border-ink py-14">
                    <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
                        <Reveal>
                            <p className="eyebrow"><span className="text-brand-ink">03 · </span>Isolation is the product</p>
                            <blockquote className="mt-6 border-s-2 border-accent ps-6">
                                <p id="trust-heading" className="font-serif text-4xl leading-tight font-medium text-balance text-ink italic sm:text-5xl">
                                    “Acme&apos;s leave policy never appears in Globex&apos;s answer.”
                                </p>
                                <footer className="mt-5 text-sm text-muted">
                                    Enforced in the retrieval query, not just the interface — and proven by a
                                    cross-tenant test on every build.
                                </footer>
                            </blockquote>
                        </Reveal>

                        <Reveal delay={150}>
                            <h3 className="eyebrow text-ink">Safeguards</h3>
                            <div aria-hidden="true" className="rule-line mt-2 border-t border-ink" />
                            <ol className="mt-2">
                                {SAFEGUARDS.map((item, i) => (
                                    <li key={item} className="flex gap-4 border-b border-hairline py-4">
                                        <span className="font-mono text-xs text-brand-ink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="text-sm text-ink">{item}</span>
                                    </li>
                                ))}
                            </ol>
                        </Reveal>
                    </div>
                </section>

                {!user && (
                    <section aria-labelledby="cta-heading" className="pb-20">
                        <Reveal className="relative mx-auto max-w-2xl rounded-card border border-hairline bg-surface px-6 pt-12 pb-10 text-center shadow-sheet sm:px-12">
                            <span aria-hidden="true" className="rule-double absolute inset-x-6 top-4 sm:inset-x-12" />
                            <p className="eyebrow">Sign-up slip</p>
                            <h2 id="cta-heading" className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                                Stop answering the same policy question <em className="font-normal">twice.</em>
                            </h2>
                            <p className="mt-3 text-muted">Create a workspace, upload your handbook, and invite your team.</p>
                            <div className="mt-8 flex justify-center">
                                <ButtonLink href="/signup" size="lg">Get started →</ButtonLink>
                            </div>
                        </Reveal>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
