<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;

class WorkspaceService
{
    /**
     * Fetch every workspace the user belongs to.
     *
     * Read from the `workspace_user` pivot only, which is the single source of truth for
     * access. Owned workspaces are not a separate bucket: the creator is enrolled as a pivot
     * member with the `owner` role, so splitting owned from joined would return each owned
     * workspace twice. Callers that need to distinguish them compare `owner_id`.
     *
     * There is deliberately no method that lists every workspace: with private-only tenancy
     * a platform-wide listing would disclose which companies exist on the instance.
     *
     * @param  User  $user
     * @return Collection<int, Workspace>
     */
    public function fetchMyWorkspaces(User $user): Collection
    {
        return $user->workspaces()
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  Workspace  $workspace
     * @return Collection<int, User>
     */
    public function fetchMembers(Workspace $workspace): Collection
    {
        return $workspace->members()
            ->get()
            ->each(fn (User $member) => $member->is_owner = $member->id === $workspace->owner_id)
            ->sortByDesc('is_owner')
            ->values();
    }
}
