import { notFound } from "next/navigation";
import { API_ROUTES } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Workspace, WorkspaceInvitation, WorkspaceMember } from "@/lib/types";
import AskPanel from "./AskPanel";
import DocumentsPanel from "./DocumentsPanel";
import MembersPanel from "./MembersPanel";
import WorkspaceHeader from "./WorkspaceHeader";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

/**
 * The tab title is the workspace name — a second `show` request, which Next dedupes against the page body's.
 *
 * @param {PageProps} props
 * @return {Promise<{ title: string }>}
 */
export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;

    const response = await fetchFromBackend<ApiResponse<Workspace>>(
        API_ROUTES.workspaces.show(id)
    );

    return { title: response?.data.name ?? "Not found" };
}

/**
 * One workspace: identity, Ask, documents, roster. The three requests are independent, so they go
 * out together; invitations are fetched even for non-owners (a 403 becomes `null`) so ownership doesn't serialise them.
 *
 * A `null` workspace is a 404 on purpose: in a multi-tenant product a 403 would confirm that another
 * company's workspace occupies this id.
 *
 * @param {PageProps} props
 * @return {Promise<JSX.Element>}
 */
export default async function WorkspacePage({ params }: PageProps) {
    const { id } = await params;

    const [workspaceRes, membersRes, invitationsRes] = await Promise.all([
        fetchFromBackend<ApiResponse<Workspace>>(API_ROUTES.workspaces.show(id)),
        fetchFromBackend<ApiResponse<WorkspaceMember[]>>(API_ROUTES.workspaces.members(id)),
        fetchFromBackend<ApiResponse<WorkspaceInvitation[]>>(API_ROUTES.workspaces.invitations(id)),
    ]);

    if (!workspaceRes) {
        notFound();
    }

    const workspace = workspaceRes.data;
    // Kept nullable on purpose: the panel distinguishes "failed to load" from "none".
    const members = membersRes?.data ?? null;
    // Unlike members, empty is the normal case here, so a failure collapses to it.
    const invitations = invitationsRes?.data ?? [];

    return (
        // Main column first in the DOM: mobile and screen readers reach Ask before the roster.
        <div className="flex flex-col items-start gap-8 lg:flex-row">
            <div className="w-full min-w-0 flex-1 space-y-8">
                <WorkspaceHeader workspace={workspace} memberCount={members?.length ?? null} />
                <AskPanel workspace={workspace} />
                <DocumentsPanel workspace={workspace} />
            </div>

            <aside aria-label="Members" className="w-full lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
                <MembersPanel
                    members={members}
                    invitations={invitations}
                    canInvite={workspace.is_owner}
                    workspace={workspace}
                />
            </aside>
        </div>
    );
}
