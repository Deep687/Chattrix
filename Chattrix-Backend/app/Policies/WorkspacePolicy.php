<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

/**
 * Authorises tenant-level access to a workspace.
 *
 * Every workspace is private, so each ability below resolves to one question: does the user
 * have a `workspace_user` row for this workspace? Ownership is the only elevation above
 * membership, and it governs the workspace record itself — not the documents inside it.
 *
 * This class is the HTTP-facing half of tenant isolation. The other half lives in the
 * retrieval query, which filters on `workspace_id` independently. Neither layer may assume
 * the other ran, and there is deliberately no platform-admin bypass in either.
 */
class WorkspacePolicy
{
    /**
     * Any authenticated user may ask for their workspaces, but the listing only ever returns
     * the ones they belong to — see `WorkspaceService::fetchMyWorkspaces()`. There is no
     * platform-wide workspace index, because private-only leaves nothing to browse.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Workspace $workspace): bool
    {
        return $workspace->hasMember($user);
    }

    /**
     * Any authenticated user may create a workspace, becoming its owner.
     */
    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }

    /**
     * Invite or remove members. Owner-only, and the gate the invite flow will authorise against.
     */
    public function manageMembers(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }

    /**
     * Read the workspace's documents. Owners and members both qualify; a future read-only
     * Viewer role would qualify here too, which is why this is not an ownership check.
     */
    public function viewDocuments(User $user, Workspace $workspace): bool
    {
        return $workspace->hasMember($user);
    }

    public function uploadDocument(User $user, Workspace $workspace): bool
    {
        return $workspace->hasMember($user);
    }

    public function deleteDocument(User $user, Workspace $workspace): bool
    {
        return $workspace->hasMember($user);
    }

    /**
     * Ask a grounded question against this workspace's documents.
     *
     * Passing this check is necessary but not sufficient: the retrieval query still filters
     * chunks by `workspace_id`, so a bug here cannot on its own leak another tenant's content.
     */
    public function ask(User $user, Workspace $workspace): bool
    {
        return $workspace->hasMember($user);
    }

    public function restore(User $user, Workspace $workspace): bool
    {
        return false;
    }

    public function forceDelete(User $user, Workspace $workspace): bool
    {
        return false;
    }
}
