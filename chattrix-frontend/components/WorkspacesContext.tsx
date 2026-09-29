"use client"
import { createContext, useContext } from "react";
import type { Workspace } from "@/lib/types";

/** The caller's workspaces, fetched once in `app/(app)/layout.tsx` and shared so pages don't refetch. */
export const WorkspacesContext = createContext<Workspace[]>([]);

export function useWorkspaces(): Workspace[] {
    return useContext(WorkspacesContext);
}
