import { notFound } from "next/navigation";
import { API_ROUTES } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Workspace, WorkspaceMember } from "@/lib/types";
import MembersPanel from "./MembersPanel";
import WorkspaceHeader from "./WorkspaceHeader";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

/**
 * The tab title is the workspace name, which means a second `show` request. Next dedupes it
 * against the one in the page body for the same render, so this costs nothing extra.
 */
export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;

    const response = await fetchFromBackend<ApiResponse<Workspace>>(
        API_ROUTES.workspaces.show(id)
    );

    return { title: response?.data.name ?? "Workspace" };
}

/**
 * A single workspace: its identity, its documents, and its roster.
 *
 * A Server Component, so it reads the access-token cookie and calls Laravel directly rather than
 * hopping through the BFF routes in `app/api/` — those exist for the browser, which cannot read an
 * httpOnly cookie. This code already has that access.
 *
 * The two requests are independent, so they go out together. Awaiting them in sequence would
 * double time-to-first-byte for no reason.
 *
 * `fetchFromBackend` returns `null` for 404, 403 and a missing token alike, so the workspace being
 * `null` becomes a 404 here. That deliberately conflates "does not exist" with "not yours": in a
 * multi-tenant product a 403 would confirm that some other company's workspace occupies this id.
 */
export default async function WorkspacePage({ params }: PageProps) {
    const { id } = await params;

    const [workspaceRes, membersRes] = await Promise.all([
        fetchFromBackend<ApiResponse<Workspace>>(API_ROUTES.workspaces.show(id)),
        fetchFromBackend<ApiResponse<WorkspaceMember[]>>(API_ROUTES.workspaces.members(id)),
    ]);

    if (!workspaceRes) {
        notFound();
    }

    const workspace = workspaceRes.data;
    // Kept nullable on purpose: the panel distinguishes "failed to load" from "none".
    const members = membersRes?.data ?? null;

    return (
        // Main column first in the DOM, rail second. That is also the visual order, so no CSS
        // reordering is needed — and it means mobile and screen readers reach the workspace and
        // its documents before the roster, which is reference material.
        <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 w-full space-y-6">
                <WorkspaceHeader workspace={workspace} memberCount={members?.length ?? null} />

                <section className="bg-overlay rounded-xl border border-white/5 p-6 space-y-4">
                    <h2 className="text-sm font-semibold">Documents</h2>

                    <div className="border border-dashed border-white/10 rounded-lg px-6 py-10 text-center">
                        <span className="text-brand text-2xl mb-3 block">⬡</span>
                        <p className="text-sm font-medium mb-1">No documents yet</p>
                        <p className="text-dim text-sm leading-relaxed max-w-sm mx-auto">
                            Upload this company&apos;s policies, then ask questions against them.
                        </p>
                    </div>
                </section>

                <section className="bg-overlay rounded-xl border border-white/5 p-6 space-y-4">
                    <h2 className="text-sm font-semibold">Ask</h2>

                    <p className="text-dim text-sm leading-relaxed">
                        Upload a document to start asking questions about this company&apos;s
                        policies.
                    </p>
                </section>
            </div>

            <aside className="w-full lg:w-70 lg:shrink-0">
                <MembersPanel members={members} canInvite={workspace.is_owner} workspace={workspace} />
            </aside>
        </div>
    );
}
