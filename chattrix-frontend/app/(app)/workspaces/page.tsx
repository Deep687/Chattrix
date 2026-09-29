import { API_ROUTES } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Workspace } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import WorkspaceCard from "./WorkspaceCard";

export const metadata = { title: "Workspaces" };

/**
 * Lists the signed-in user's workspaces. A Server Component calling Laravel directly: the BFF route
 * exists for the browser, which can't read the httpOnly cookie, so proxying here would add a hop and protect nothing.
 */
export default async function WorkspacesPage() {
    const response = await fetchFromBackend<ApiResponse<Workspace[]>>(
        API_ROUTES.workspaces.base
    );

    const workspaces = response?.data ?? [];

    return (
        <div className="space-y-8">
            <SectionHeader
                as="h1"
                number="01"
                eyebrow="Workspaces"
                title="Your workspaces"
                lead="Each workspace holds one company's documents, private to its members. Answers never draw on another workspace."
                action={workspaces.length > 0 ? <CreateWorkspaceDialog /> : undefined}
            />

            {workspaces.length === 0 ? (
                <EmptyState icon="workspace" title="No workspaces yet" action={<CreateWorkspaceDialog />}>
                    Create a workspace for your company, upload its policy documents, then invite your
                    team to ask questions against them. Joining someone else&apos;s? Ask them for an invite.
                </EmptyState>
            ) : (
                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {workspaces.map((workspace, index) => (
                        <li
                            key={workspace.id}
                            className="motion-safe:animate-ink"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <WorkspaceCard workspace={workspace} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
