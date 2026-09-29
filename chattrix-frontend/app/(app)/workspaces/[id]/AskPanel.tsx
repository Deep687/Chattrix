import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import type { Workspace } from "@/lib/types";

const SUGGESTIONS = [
    "How many casual leaves do I get?",
    "What's the work-from-home policy?",
    "Who approves expense claims?",
];

const PROMISES = [
    "Every answer cites the exact passage it came from.",
    "When the documents don't cover it, it says “I don't know”.",
    "It searches this workspace only, never another company's.",
];

/**
 * The page's primary surface, drawn in its final shape but disabled: no document can be ready until
 * ingestion ships (M1–M2), and a composer that pretends otherwise would be the first broken promise.
 */
export default function AskPanel({ workspace }: { workspace: Workspace }) {
    return (
        <Card as="section" className="px-6 pt-6 pb-7 sm:px-8">
            <p className="eyebrow">
                <span className="text-brand-ink">02 · </span>Ask
            </p>
            <h2 className="mt-2 font-serif text-2xl leading-tight font-semibold tracking-tight text-ink">
                Ask {workspace.name}&apos;s policies
            </h2>
            <p className="mt-1.5 text-sm text-muted">Plain-English questions, answered only from this workspace&apos;s documents.</p>

            {/* A ruled writing line rather than an input box: the page is waiting to be written on. */}
            <div className="mt-6 flex items-end gap-3 border-b-2 border-ink/80 pb-2">
                <label htmlFor="ask-input" className="sr-only">Question</label>
                <span aria-hidden="true" className="h-7 w-px shrink-0 bg-brand motion-safe:animate-caret" />
                <input
                    id="ask-input"
                    type="text"
                    disabled
                    placeholder={`Ask ${workspace.name}'s policies…`}
                    className="min-w-0 flex-1 bg-transparent py-1 font-serif text-xl text-ink placeholder:text-muted placeholder:italic disabled:cursor-not-allowed"
                />
                <button
                    type="button"
                    disabled
                    aria-label="Send question"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-control text-muted disabled:cursor-not-allowed"
                >
                    <Icon name="send" className="size-4" />
                </button>
            </div>

            <div className="mt-4">
                <p className="eyebrow">Try asking</p>
                <ul aria-label="Example questions" className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {SUGGESTIONS.map((question, i) => (
                        <li key={question}>
                            <button
                                type="button"
                                disabled
                                className="inline-flex items-baseline gap-1 font-serif text-[0.9375rem] text-muted italic disabled:cursor-not-allowed"
                            >
                                <span className="footnote not-italic">{i + 1}</span>
                                {question}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6">
                <Alert tone="info">Asking unlocks once a document in this workspace is ready.</Alert>
            </div>

            <ol className="mt-7 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-3">
                {PROMISES.map((promise, i) => (
                    <li key={promise} className="flex gap-2.5 text-sm text-pretty text-muted">
                        <span className="font-mono text-[0.6875rem] text-brand-ink tabular-nums">§{i + 1}</span>
                        {promise}
                    </li>
                ))}
            </ol>
        </Card>
    );
}
