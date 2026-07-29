import { API_ROUTES, assetUrl } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Workspace } from "@/lib/types";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

/**
 * Lists the workspaces the signed-in user belongs to.
 *
 * A Server Component, so it reads the access-token cookie and calls Laravel directly. It does
 * not go through the BFF route at `/api/workspaces` — that route exists for the browser, which
 * cannot read an httpOnly cookie. This code already runs on the server with the same access, so
 * proxying through our own API would add an HTTP hop and protect nothing.
 */
export default async function WorkspacesPage() {
    const response = await fetchFromBackend<ApiResponse<Workspace[]>>(
        API_ROUTES.workspaces.base
    );

    const workspaces = response?.data ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold">Workspaces</h1>
                    <p className="text-dim text-sm mt-1">
                        Each workspace holds one company&apos;s documents, private to its members.
                    </p>
                </div>

                {workspaces.length > 0 && <CreateWorkspaceDialog />}
            </div>

            {workspaces.length === 0 ? (
                <div className="bg-overlay rounded-xl border border-white/5 px-8 py-14 text-center space-y-6">
                    <div>
                        <span className="text-brand text-3xl mb-4 block">⬡</span>
                        <h3 className="text-sm font-semibold mb-1.5">No workspaces yet</h3>
                        <p className="text-dim text-sm leading-relaxed max-w-sm mx-auto">
                            Create your first workspace, then upload your policy documents and
                            invite your team to ask questions against them.
                        </p>
                    </div>

                    <CreateWorkspaceDialog />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workspaces.map((workspace) => (
                        <WorkspaceCard key={workspace.id} workspace={workspace} />
                    ))}
                </div>
            )}
        </div>
    );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
    return (
        <div className="bg-overlay rounded-xl border border-white/5 p-6">
            <div className="flex items-start gap-4">
                {workspace.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={assetUrl(workspace.avatar)}
                        alt=""
                        className="size-11 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="size-11 rounded-lg bg-surface border border-white/10 grid place-items-center text-brand shrink-0"
                    >
                        ⬡
                    </div>
                )}

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">{workspace.name}</h3>
                        {workspace.role === 'owner' && (
                            <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/25 rounded px-1.5 py-0.5">
                                Owner
                            </span>
                        )}
                    </div>

                    <p className="text-dim text-sm leading-relaxed mt-1">
                        {workspace.description || 'No description yet.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
