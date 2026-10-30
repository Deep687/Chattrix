/** Mirrors `App\Http\Resources\WorkspaceResource`. */
export type Workspace = {
    id: number;
    name: string;
    description: string | null;
    avatar: string | null;
    owner_id: number;
    /**
     * Whether the caller owns this workspace. Derived server-side from `owner_id`, so it is
     * always present — unlike the pivot role it replaced, which was absent on any workspace
     * not fetched through the membership relation.
     */
    is_owner: boolean;
    created_at: string;
};

/** Envelope produced by `App\Traits\ApiResponser`. */
export type ApiResponse<T> = {
    data: T;
    statusCode: number;
    message: string;
};

/** Mirrors `App\Http\Resources\WorkspaceInvitationResource`. No token field, by design. */
export type WorkspaceInvitation = {
    id: number;
    workspace_id: number;
    email: string;
    /** ISO timestamp. Expired rows are still returned — the backend filters on acceptance only. */
    expires_at: string;
};

/** Mirrors `App\Http\Resources\WorkspaceMemberResource`. */
export type WorkspaceMember = {
    id: number;
    name: string;
    email: string;
    is_owner: boolean;
    /** Pivot column `workspace_user.joined_at`, serialised as an ISO timestamp. */
    joined_at: string;
};


/**
 * Mirrors `App\Http\Resources\WorkspaceInvitationPreviewResource`.
 *
 * Served unauthenticated to whoever holds the link, so it is deliberately thinner than
 * `WorkspaceInvitation` — enough to say what the invite is for, and nothing else.
 */
export type WorkspaceInvitationPreview = {
    email: string;
    expires_at: string;
    workspace: {
        id: number;
        name: string;
        avatar: string | null;
    };
    invited_by: string | null;
};

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

/** Mirrors `App\Http\Resources\DocumentResource`. No storage path, by design. */
export type WorkspaceDocument = {
    id: number;
    filename: string;
    mime_type: string;
    status: DocumentStatus;
    /** Readable reason, set only when `status` is `failed`. */
    error: string | null;
    chunk_count: number;
    /** `null` once the uploader's account is deleted; the document stays. */
    uploader: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
};

/** One retrieved passage, from the `sources` event of the ask stream. `n` is its citation number. */
export type AskSource = {
    n: number;
    document_id: number;
    filename: string;
    page: number | null;
    excerpt: string;
};

/** The `sources` event. `search_query` is set when a follow-up was rewritten before searching. */
export type AskSources = {
    search_query: string | null;
    items: AskSource[];
};

/** The `done` event of the ask stream. */
export type AskDone = {
    message_id: number;
    /** False when the documents didn't cover the question; the client shows a "not covered" state. */
    answered: boolean;
    cited: number[];
    /** How many ready documents the question was searched against. */
    searched_documents: number;
    usage: { prompt_tokens: number; output_tokens: number; latency_ms: number };
};

/** The `error` event of the ask stream. `reference` matches the server log line for support. */
export type AskError = {
    message: string;
    reference: string;
};

/** Mirrors `App\Http\Resources\ConversationMessageResource`. Private to the person who asked. */
export type ConversationMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
    search_query: string | null;
    /** Only the passages the answer cited. */
    sources: AskSource[];
    cited: number[];
    /** `null` on user messages. */
    answered: boolean | null;
    created_at: string;
};

/** Mirrors `App\Http\Resources\ConversationResource`. `messages` is present only on `show`. */
export type Conversation = {
    id: number;
    title: string;
    messages?: ConversationMessage[];
    created_at: string;
    updated_at: string;
};
