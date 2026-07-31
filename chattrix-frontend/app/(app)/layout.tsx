import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { API_ROUTES } from "@/lib/api";
import { fetchFromBackend } from "@/lib/serverFetch";
import type { ApiResponse, Workspace } from "@/lib/types";

/**
 * Fetches the sidebar's workspace list here rather than inside `Sidebar`.
 *
 * `Sidebar` is a client component — it needs `usePathname` and the mobile drawer state — so it
 * cannot read the httpOnly access-token cookie. Fetching in this Server Component and passing the
 * list down avoids both a BFF round trip and a Redux slice, and the list arrives in the first HTML
 * rather than appearing after hydration.
 *
 * The cost is one small query on every page under `(app)`, which the sidebar renders on anyway.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const response = await fetchFromBackend<ApiResponse<Workspace[]>>(
    API_ROUTES.workspaces.base
  );

  return <AppShell workspaces={response?.data ?? []}>{children}</AppShell>;
}
