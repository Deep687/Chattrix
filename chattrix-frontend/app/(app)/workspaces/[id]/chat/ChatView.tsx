"use client"
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Icon from "@/components/ui/Icon";
import type { ApiResponse, AskDone, AskError, AskSource, AskSources, Conversation, ConversationMessage, Workspace } from "@/lib/types";

const SUGGESTIONS = [
    "How many casual leaves do I get?",
    "What's the work-from-home policy?",
    "What's my notice period?",
    "Who approves expense claims?",
];

/** Mirrors `AskQuestionRequest` / `config('rag.max_question_length')`. */
const MAX_QUESTION = 1000;

/** Mirrors `RagService::DONT_KNOW`. Only used to avoid flashing the raw sentence while it streams. */
const DONT_KNOW = "I don't know based on the provided documents.";

/** One bubble pair as the UI tracks it: saved messages and the one being streamed share this shape. */
type Exchange = {
    key: string;
    question: string;
    answer: string;
    searchQuery: string | null;
    /** Every retrieved passage while streaming; only the cited ones once loaded from history. */
    sources: AskSource[];
    cited: number[] | null;
    answered: boolean | null;
    searchedDocuments: number | null;
    error: AskError | null;
};

type ChatViewProps = {
    workspace: Workspace;
    initialConversations: Conversation[];
    initialConversation: Conversation | null;
    initialQuestion: string | null;
    readyCount: number;
};

/**
 * Chat over one workspace's documents. Threads are saved server-side and private to the asker;
 * switching threads happens client-side and only rewrites the URL, so it costs one small fetch.
 */
export default function ChatView({ workspace, initialConversations, initialConversation, initialQuestion, readyCount }: ChatViewProps) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeId, setActiveId] = useState<number | null>(initialConversation?.id ?? null);
    const [exchanges, setExchanges] = useState<Exchange[]>(() => toExchanges(initialConversation?.messages ?? []));
    const [question, setQuestion] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [loadingThread, setLoadingThread] = useState(false);
    const [threadsOpen, setThreadsOpen] = useState(false);
    const [loadError, setLoadError] = useState("");

    const abort = useRef<AbortController | null>(null);
    const scroller = useRef<HTMLDivElement>(null);
    const stickToBottom = useRef(true);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const askedInitial = useRef(false);

    const canAsk = readyCount > 0;

    // Leaving the page mid-answer cancels the request, which stops the model call upstream.
    useEffect(() => () => abort.current?.abort(), []);

    // Follow the stream only while the reader is at the bottom; scrolling up to re-read pauses it.
    useEffect(() => {
        if (stickToBottom.current && scroller.current) {
            scroller.current.scrollTop = scroller.current.scrollHeight;
        }
    }, [exchanges]);

    const onScroll = () => {
        const el = scroller.current;
        if (el) {
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }
    };

    const setUrl = (conversationId: number | null) => {
        const url = conversationId ? `?c=${conversationId}` : window.location.pathname;
        window.history.replaceState(null, "", url);
    };

    const updateLast = (patch: (e: Exchange) => Partial<Exchange>) =>
        setExchanges((all) => all.map((e, i) => (i === all.length - 1 ? { ...e, ...patch(e) } : e)));

    const ask = useCallback(async (text: string) => {
        const q = text.trim();

        if (!q || streaming || !canAsk) {
            return;
        }

        abort.current = new AbortController();
        stickToBottom.current = true;
        setStreaming(true);
        setQuestion("");
        setExchanges((all) => [...all, {
            key: `pending-${Date.now()}`, question: q, answer: "", searchQuery: null, sources: [],
            cited: null, answered: null, searchedDocuments: null, error: null,
        }]);

        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q, conversation_id: activeId }),
                signal: abort.current.signal,
            });

            if (!response.ok || !response.body) {
                const message = await requestError(response);
                updateLast(() => ({ error: { message, reference: "" } }));
                return;
            }

            for await (const event of readEvents(response.body)) {
                if (event.name === "conversation") {
                    const thread = event.data as { id: number; title: string };
                    setActiveId(thread.id);
                    setUrl(thread.id);
                    // New threads go on top; an existing one moves there, since it was just used.
                    setConversations((all) => [
                        { id: thread.id, title: thread.title, created_at: "", updated_at: new Date().toISOString() },
                        ...all.filter((c) => c.id !== thread.id),
                    ]);
                } else if (event.name === "sources") {
                    const data = event.data as AskSources;
                    updateLast(() => ({ sources: data.items, searchQuery: data.search_query }));
                } else if (event.name === "delta") {
                    updateLast((e) => ({ answer: e.answer + (event.data as { text: string }).text }));
                } else if (event.name === "done") {
                    const done = event.data as AskDone;
                    updateLast(() => ({ cited: done.cited, answered: done.answered, searchedDocuments: done.searched_documents }));
                } else if (event.name === "error") {
                    updateLast(() => ({ error: event.data as AskError }));
                }
            }
        } catch (err) {
            const aborted = err instanceof DOMException && err.name === "AbortError";
            updateLast(() => ({
                error: { message: aborted ? "Stopped." : "The connection dropped before the answer finished.", reference: "" },
            }));
        } finally {
            setStreaming(false);
            abort.current = null;
            textarea.current?.focus();
        }
    }, [streaming, canAsk, workspace.id, activeId]);

    // `?q=` from the workspace page's suggestions: ask it once, on arrival.
    useEffect(() => {
        if (initialQuestion && !askedInitial.current) {
            askedInitial.current = true;
            ask(initialQuestion);
        }
    }, [initialQuestion, ask]);

    const openThread = async (id: number) => {
        if (streaming || id === activeId) {
            setThreadsOpen(false);
            return;
        }

        setThreadsOpen(false);
        setLoadingThread(true);
        setLoadError("");

        try {
            const { data } = await axios.get<ApiResponse<Conversation>>(`/api/workspaces/${workspace.id}/conversations/${id}`);
            setActiveId(id);
            setExchanges(toExchanges(data.data.messages ?? []));
            setUrl(id);
            stickToBottom.current = true;
        } catch {
            setLoadError("Could not open that conversation.");
        } finally {
            setLoadingThread(false);
        }
    };

    const newThread = () => {
        if (streaming) {
            return;
        }

        setActiveId(null);
        setExchanges([]);
        setUrl(null);
        setThreadsOpen(false);
        textarea.current?.focus();
    };

    const deleteThread = async (conversation: Conversation) => {
        if (!window.confirm(`Delete “${conversation.title}”? This can't be undone.`)) {
            return;
        }

        try {
            await axios.delete(`/api/workspaces/${workspace.id}/conversations/${conversation.id}`);
            setConversations((all) => all.filter((c) => c.id !== conversation.id));

            if (conversation.id === activeId) {
                newThread();
            }
        } catch {
            setLoadError("Could not delete that conversation.");
        }
    };

    const retry = () => {
        const last = exchanges[exchanges.length - 1];

        if (last) {
            setExchanges((all) => all.slice(0, -1));
            ask(last.question);
        }
    };

    // Auto-grow the composer up to ~8 lines, then scroll inside it.
    useEffect(() => {
        const el = textarea.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
        }
    }, [question]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter sends, Shift+Enter breaks the line; IME composition must not send half a word.
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            ask(question);
        }
    };

    const activeTitle = conversations.find((c) => c.id === activeId)?.title;

    return (
        <div className="flex min-h-0 flex-1">
            {/* Thread list: a rail on desktop, a drawer on mobile. */}
            {threadsOpen && (
                <button type="button" aria-label="Close conversations" onClick={() => setThreadsOpen(false)} className="fixed inset-0 z-30 bg-ink/20 lg:hidden" />
            )}
            <aside
                aria-label="Conversations"
                className={`${threadsOpen ? "fixed inset-y-0 start-0 z-40 flex shadow-xl" : "hidden"} w-72 shrink-0 flex-col border-e border-hairline bg-surface lg:static lg:flex lg:shadow-none`}
            >
                <div className="flex items-center gap-2 border-b border-hairline p-3">
                    <button
                        type="button"
                        onClick={newThread}
                        disabled={streaming}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-control border border-control bg-canvas px-3 py-2 text-sm font-medium text-ink hover:border-ink disabled:opacity-50"
                    >
                        <Icon name="plus" className="size-4" />
                        New chat
                    </button>
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted">Your conversations will appear here. Only you can see them.</p>
                    ) : (
                        <ul className="space-y-0.5">
                            {conversations.map((conversation) => (
                                <li key={conversation.id} className="group relative">
                                    <button
                                        type="button"
                                        onClick={() => openThread(conversation.id)}
                                        aria-current={conversation.id === activeId ? "page" : undefined}
                                        className={`w-full rounded-control py-2 ps-3 pe-9 text-start text-sm ${conversation.id === activeId ? "bg-brand/10 text-ink" : "text-muted hover:bg-surface-muted hover:text-ink"}`}
                                    >
                                        <span className="block truncate">{conversation.title}</span>
                                        <span className="block text-[0.6875rem] text-muted">{relativeTime(conversation.updated_at)}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteThread(conversation)}
                                        aria-label={`Delete conversation ${conversation.title}`}
                                        className="absolute end-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-control text-muted opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-danger-ink focus-visible:opacity-100"
                                    >
                                        <Icon name="trash" className="size-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </nav>

                <p className="border-t border-hairline px-4 py-3 text-[0.6875rem] text-muted">
                    <Icon name="lock" className="me-1 inline size-3 align-[-2px]" />
                    Private to you. Not even the workspace owner can read them.
                </p>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col bg-canvas">
                {/* Header */}
                <header className="flex items-center gap-3 border-b border-hairline px-4 py-3 sm:px-6">
                    <button type="button" onClick={() => setThreadsOpen(true)} aria-label="Show conversations" className="inline-flex size-8 items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-ink lg:hidden">
                        <Icon name="menu" className="size-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{activeTitle ?? "New conversation"}</p>
                        <p className="truncate text-xs text-muted">
                            {workspace.name} · {readyCount} {readyCount === 1 ? "document" : "documents"} indexed
                        </p>
                    </div>
                    <Link href={`/workspaces/${workspace.id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-muted hover:text-ink">
                        <Icon name="arrow" className="size-3.5 rotate-180" />
                        Workspace
                    </Link>
                </header>

                {/* Messages */}
                <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
                        {loadError && <p role="alert" className="mb-4 text-sm text-danger-ink">{loadError}</p>}

                        {loadingThread ? (
                            <p className="py-20 text-center text-sm text-muted">Opening conversation…</p>
                        ) : exchanges.length === 0 ? (
                            <Welcome workspace={workspace} canAsk={canAsk} onPick={ask} />
                        ) : (
                            <ol className="space-y-8">
                                {exchanges.map((exchange, i) => (
                                    <li key={exchange.key}>
                                        <ExchangeView
                                            exchange={exchange}
                                            workspace={workspace}
                                            streaming={streaming && i === exchanges.length - 1}
                                            onRetry={i === exchanges.length - 1 && !streaming ? retry : undefined}
                                        />
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>

                {/* Composer */}
                <div className="border-t border-hairline bg-canvas px-4 pt-3 pb-4 sm:px-6">
                    <form
                        onSubmit={(e) => { e.preventDefault(); ask(question); }}
                        className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-control bg-surface p-2 shadow-sm focus-within:border-ink"
                    >
                        <label htmlFor="chat-input" className="sr-only">Message</label>
                        <textarea
                            id="chat-input"
                            ref={textarea}
                            rows={1}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={onKeyDown}
                            disabled={!canAsk}
                            maxLength={MAX_QUESTION}
                            placeholder={canAsk ? `Ask about ${workspace.name}'s policies…` : "Asking unlocks once a document is ready"}
                            className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[0.9375rem] text-ink placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
                        />
                        {streaming ? (
                            <button type="button" onClick={() => abort.current?.abort()} aria-label="Stop answering" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas hover:opacity-90">
                                <span className="size-3 rounded-[2px] bg-current" />
                            </button>
                        ) : (
                            <button type="submit" disabled={!canAsk || !question.trim()} aria-label="Send" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand hover:bg-brand-strong disabled:bg-surface-muted disabled:text-muted">
                                <Icon name="send" className="size-4" />
                            </button>
                        )}
                    </form>
                    <p className="mx-auto mt-2 max-w-3xl text-center text-[0.6875rem] text-muted">
                        Answers come only from {workspace.name}&apos;s documents and cite their source. Enter to send · Shift+Enter for a new line.
                    </p>
                </div>
            </section>
        </div>
    );
}

function Welcome({ workspace, canAsk, onPick }: { workspace: Workspace; canAsk: boolean; onPick: (q: string) => void }) {
    return (
        <div className="flex flex-col items-center py-10 text-center sm:py-16">
            <span className="inline-flex size-12 items-center justify-center rounded-full border border-control text-brand-ink">
                <Icon name="sparkle" className="size-5" />
            </span>
            <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-ink">Ask {workspace.name}&apos;s policies</h1>
            <p className="mt-2 max-w-md text-sm text-muted">
                Plain-English questions about leave, expenses, security and more. Every answer cites the passage it came from,
                and says so when the documents don&apos;t cover it.
            </p>

            {canAsk ? (
                <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => onPick(suggestion)}
                            className="rounded-card border border-hairline bg-surface px-4 py-3 text-start text-sm text-ink hover:border-control"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="mt-8 rounded-card border border-hairline bg-surface px-4 py-3 text-sm text-muted">
                    No documents are ready yet. {workspace.is_owner ? "Upload one from the workspace page." : "Your workspace owner needs to upload one first."}
                </p>
            )}
        </div>
    );
}

function ExchangeView({ exchange, workspace, streaming, onRetry }: {
    exchange: Exchange;
    workspace: Workspace;
    streaming: boolean;
    onRetry?: () => void;
}) {
    const [open, setOpen] = useState<number | null>(null);

    const finished = exchange.answered !== null;
    const notCovered = exchange.answered === false;
    // While the fallback sentence is still arriving, keep showing "searching" instead of the raw line.
    const mayBeNotCovered = !finished && exchange.answer !== "" && DONT_KNOW.startsWith(exchange.answer.trim());
    const cited = exchange.cited ? exchange.sources.filter((s) => exchange.cited!.includes(s.n)) : [];
    const selected = exchange.sources.find((s) => s.n === open) ?? null;
    const toggle = (n: number) => setOpen((current) => (current === n ? null : n));

    return (
        <div className="space-y-3">
            {/* The employee's message */}
            <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand/12 px-4 py-2.5 text-[0.9375rem] whitespace-pre-wrap text-ink">
                    {exchange.question}
                </p>
            </div>

            {/* The assistant's reply */}
            <div className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-control text-brand-ink">
                    <Icon name="sparkle" className="size-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                    {exchange.searchQuery && (
                        <p className="mb-1.5 text-xs text-muted italic">Searched for “{exchange.searchQuery}”</p>
                    )}

                    {notCovered ? (
                        <div className="rounded-card border border-hairline bg-surface px-4 py-3">
                            <p className="text-[0.9375rem] font-medium text-ink">{workspace.name}&apos;s documents don&apos;t cover this.</p>
                            <p className="mt-1 text-sm text-muted">Try rephrasing, or ask whoever manages your policies.</p>
                            {exchange.searchedDocuments !== null && (
                                <p className="mt-2 text-[0.6875rem] tracking-wide text-muted uppercase">
                                    Searched {exchange.searchedDocuments} {exchange.searchedDocuments === 1 ? "document" : "documents"}
                                </p>
                            )}
                        </div>
                    ) : exchange.answer && !mayBeNotCovered ? (
                        <div className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink">
                            {renderWithCitations(exchange.answer, exchange.sources, open, toggle)}
                            {streaming && <span aria-hidden="true" className="ms-0.5 inline-block h-4 w-1.5 animate-pulse bg-brand align-middle" />}
                        </div>
                    ) : streaming ? (
                        <p className="flex items-center gap-2 text-sm text-muted">
                            <span className="inline-flex gap-1" aria-hidden="true">
                                <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
                                <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
                                <span className="size-1.5 animate-bounce rounded-full bg-muted" />
                            </span>
                            Searching {workspace.name}&apos;s documents…
                        </p>
                    ) : null}

                    {exchange.error && (
                        <div role="alert" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger-ink">
                            <span>{exchange.error.message}</span>
                            {exchange.error.reference && <span className="font-mono text-xs text-muted">Ref {exchange.error.reference}</span>}
                            {onRetry && (
                                <button type="button" onClick={onRetry} className="ms-auto font-medium text-ink underline underline-offset-2">
                                    Retry
                                </button>
                            )}
                        </div>
                    )}

                    {cited.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {cited.map((source) => (
                                <button
                                    key={source.n}
                                    type="button"
                                    onClick={() => toggle(source.n)}
                                    aria-expanded={open === source.n}
                                    className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${open === source.n ? "border-brand bg-brand/10 text-ink" : "border-hairline bg-surface text-muted hover:border-control hover:text-ink"}`}
                                >
                                    <span className="font-mono font-semibold text-brand-ink">{source.n}</span>
                                    <Icon name="document" className="size-3 shrink-0" />
                                    <span className="truncate">{source.filename}</span>
                                    {source.page && <span className="shrink-0">· p.{source.page}</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {selected && (
                        <blockquote className="mt-2 rounded-card border-s-2 border-brand bg-surface px-4 py-3 text-sm motion-safe:animate-ink-fast">
                            <p className="text-xs font-medium text-brand-ink">
                                [{selected.n}] {selected.filename}{selected.page ? ` · page ${selected.page}` : ""}
                            </p>
                            <p className="mt-1.5 whitespace-pre-wrap text-ink">{selected.excerpt}</p>
                        </blockquote>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Pairs saved messages into exchanges. A question with no reply (a failed answer) stands alone. */
function toExchanges(messages: ConversationMessage[]): Exchange[] {
    const exchanges: Exchange[] = [];

    for (const message of messages) {
        if (message.role === "user") {
            exchanges.push({
                key: `m-${message.id}`, question: message.content, answer: "", searchQuery: null, sources: [],
                cited: null, answered: null, searchedDocuments: null, error: null,
            });
            continue;
        }

        const last = exchanges[exchanges.length - 1];
        if (last && last.answered === null) {
            last.answer = message.content;
            last.sources = message.sources;
            last.cited = message.cited;
            last.answered = message.answered ?? true;
            last.searchQuery = message.search_query && message.search_query !== last.question ? message.search_query : null;
        }
    }

    // A saved question without a reply means the answer failed at the time.
    return exchanges.map((e) => (e.answered === null
        ? { ...e, error: { message: "This question wasn't answered.", reference: "" } }
        : e));
}

/** Turns "[2]" markers into citation buttons; numbers that match no source stay plain text. */
function renderWithCitations(text: string, sources: AskSource[], open: number | null, onToggle: (n: number) => void): React.ReactNode[] {
    return text.split(/(\[\d+\])/g).map((part, i) => {
        const n = Number(part.match(/^\[(\d+)\]$/)?.[1]);

        if (!n || !sources.some((s) => s.n === n)) {
            return part;
        }

        return (
            <button
                key={i}
                type="button"
                onClick={() => onToggle(n)}
                aria-label={`Show source ${n}`}
                aria-pressed={open === n}
                className={`mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded px-1 align-[2px] font-mono text-[0.625rem] font-semibold ${open === n ? "bg-brand text-on-brand" : "bg-brand/15 text-brand-ink hover:bg-brand/25"}`}
            >
                {n}
            </button>
        );
    });
}

function relativeTime(iso: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

    if (Number.isNaN(minutes) || minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
    if (minutes < 10080) return `${Math.round(minutes / 1440)} d ago`;

    return new Date(iso).toLocaleDateString();
}

/** Parses an SSE byte stream into `{ name, data }` events, buffering across chunk boundaries. */
async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<{ name: string; data: unknown }> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();

        if (done) {
            return;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            const name = block.match(/^event: (.*)$/m)?.[1];
            const data = block.match(/^data: (.*)$/m)?.[1];

            if (name && data !== undefined) {
                yield { name, data: JSON.parse(data) };
            }
        }
    }
}

async function requestError(response: Response): Promise<string> {
    if (response.status === 429) {
        return "You're asking too quickly. Wait a minute and try again.";
    }

    if (response.status === 422) {
        const body = await response.json().catch(() => null);
        return body?.errors?.question?.[0] ?? "That question can't be asked.";
    }

    if (response.status === 404) {
        return "This conversation no longer exists. Start a new chat.";
    }

    if (response.status === 401 || response.status === 403) {
        return "Your session has ended. Sign in again to keep asking.";
    }

    return "The assistant is unavailable right now. Try again in a moment.";
}
