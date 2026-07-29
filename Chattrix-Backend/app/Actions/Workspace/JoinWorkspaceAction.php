<?php

namespace App\Actions\Workspace;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;

/**
 * Grants a user membership of a workspace.
 *
 * This is the only primitive that writes a `workspace_user` row, and therefore the only place
 * tenant access is granted. It is deliberately not reachable from a self-serve HTTP route:
 * workspaces are private, so the legitimate callers are an authorised invite acceptance and
 * the seeders. Exposing this as a public join endpoint would reintroduce discovery.
 */
class JoinWorkspaceAction
{
    /**
     * @param  Workspace  $workspace
     * @param  User  $user
     * @param  WorkspaceRole  $role
     * @return bool False when the user already belongs, so the caller can report a conflict.
     */
    public function handle(Workspace $workspace, User $user, WorkspaceRole $role = WorkspaceRole::Member): bool
    {
        if ($workspace->hasMember($user)) {
            return false;
        }

        $workspace->members()->attach($user->id, [
            'role' => $role->value,
            'joined_at' => now(),
        ]);

        return true;
    }
}
