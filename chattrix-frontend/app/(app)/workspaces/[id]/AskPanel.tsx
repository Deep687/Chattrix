"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import type { Workspace } from "@/lib/types";

const SUGGESTIONS = [
    "How many casual leaves do I get?",
    "What's the work-from-home policy?",
    "Who approves expense claims?",
];

const PROMISES = [
    "Every answer cites the exact passage it came from.",
    "When the documents don't cover it, it says so instead of guessing.",
    "It searches this workspace only, never another company's.",
];

/**
 * The way into the chat. Answering happens on the full-screen chat page, so this card only takes
 * the first question and hands it over as `?q=`.
 */
export default function AskPanel({ workspace, canAsk }: { workspace: Workspace; canAsk: boolean }) {
    const router = useRouter();
    const [question, setQuestion] = useState("");
    const chatUrl = `/workspaces/${workspace.id}/chat`;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (question.trim()) {
            router.push(`${chatUrl}?q=${encodeURIComponent(question.trim())}`);
        }
    };

    return (
        <Card as="section" className="px-6 pt-6 pb-7 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="eyebrow">
                        <span className="text-brand-ink">02 · </span>Ask
                    </p>
                    <h2 className="mt-2 font-serif text-2xl leading-tight font-semibold tracking-tight text-ink">
                        Ask {workspace.name}&apos;s policies
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">Plain-English questions, answered only from this workspace&apos;s documents.</p>
                </div>

                {canAsk && (
                    <Link href={chatUrl} className={buttonClass("secondary", "sm")}>
                        <Icon name="ask" className="size-3.5" />
                        Your conversations
                    </Link>
                )}
            </div>

            {/* A ruled writing line rather than an input box: the page is waiting to be written on. */}
            <form onSubmit={handleSubmit} className="mt-6 flex items-end gap-3 border-b-2 border-ink/80 pb-2">
                <label htmlFor="ask-input" className="sr-only">Question</label>
                <span aria-hidden="true" className="h-7 w-px shrink-0 bg-brand motion-safe:animate-caret" />
                <input
                    id="ask-input"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={!canAsk}
                    autoComplete="off"
                    placeholder={`Ask ${workspace.name}'s policies…`}
                    className="min-w-0 flex-1 bg-transparent py-1 font-serif text-xl text-ink placeholder:text-muted placeholder:italic disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={!canAsk || !question.trim()}
                    aria-label="Ask in chat"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-control text-ink hover:border-ink disabled:cursor-not-allowed disabled:text-muted"
                >
                    <Icon name="send" className="size-4" />
                </button>
            </form>

            {canAsk ? (
                <div className="mt-4">
                    <p className="eyebrow">Try asking</p>
                    <ul aria-label="Example questions" className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                        {SUGGESTIONS.map((suggestion, i) => (
                            <li key={suggestion}>
                                <Link
                                    href={`${chatUrl}?q=${encodeURIComponent(suggestion)}`}
                                    className="inline-flex items-baseline gap-1 font-serif text-[0.9375rem] text-muted italic hover:text-ink"
                                >
                                    <span className="footnote not-italic">{i + 1}</span>
                                    {suggestion}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="mt-6">
                    <Alert tone="info">
                        {workspace.is_owner
                            ? "Asking unlocks once a document in this workspace is ready. Upload one below."
                            : "Asking unlocks once your workspace owner uploads a policy document."}
                    </Alert>
                </div>
            )}

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
