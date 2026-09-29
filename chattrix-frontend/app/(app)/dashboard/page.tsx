import { redirect } from "next/navigation";
import { API_ROUTES } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Workspace } from "@/lib/types";

/**
 * No dashboard: members come to ask, so they land in their workspace. Kept as a route because
 * login, the logo, and emailed links already point here.
 */
export default async function Dashboard() {
    const response = await fetchFromBackend<ApiResponse<Workspace[]>>(API_ROUTES.workspaces.base);
    const workspaces = response?.data ?? [];

    redirect(workspaces.length === 1 ? `/workspaces/${workspaces[0].id}` : "/workspaces");
}
