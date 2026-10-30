import { notFound } from "next/navigation";
import { API_ROUTES } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Conversation, Workspace, WorkspaceDocument } from "@/lib/types";
import ChatView from "./ChatView";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ c?: string; q?: string }>;
}

/**
 * @param {PageProps} props
 * @return {Promise<{ title: string }>}
 */
export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const response = await fetchFromBackend<ApiResponse<Workspace>>(API_ROUTES.workspaces.show(id));

    return { title: response ? `Ask · ${response.data.name}` : "Not found" };
}

/**
 * The chat. `?c=` opens a saved thread, `?q=` starts a new one with that question (the workspace
 * page's suggestions link here). Threads are fetched server-side so a shared or reloaded URL
 * renders the conversation in the first HTML.
 *
 * @param {PageProps} props
 * @return {Promise<JSX.Element>}
 */
export default async function ChatPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { c, q } = await searchParams;

    const [workspaceRes, conversationsRes, documentsRes, conversationRes] = await Promise.all([
        fetchFromBackend<ApiResponse<Workspace>>(API_ROUTES.workspaces.show(id)),
        fetchFromBackend<ApiResponse<Conversation[]>>(API_ROUTES.workspaces.conversations(id)),
        fetchFromBackend<ApiResponse<WorkspaceDocument[]>>(API_ROUTES.workspaces.documents(id)),
        c ? fetchFromBackend<ApiResponse<Conversation>>(API_ROUTES.workspaces.conversation(id, c)) : null,
    ]);

    // 404 rather than 403, so the URL doesn't confirm another company's workspace exists.
    if (!workspaceRes) {
        notFound();
    }

    const readyCount = (documentsRes?.data ?? []).filter((d) => d.status === "ready").length;

    return (
        <ChatView
            workspace={workspaceRes.data}
            initialConversations={conversationsRes?.data ?? []}
            initialConversation={conversationRes?.data ?? null}
            initialQuestion={c ? null : q ?? null}
            readyCount={readyCount}
        />
    );
}
