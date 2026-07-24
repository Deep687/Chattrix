<?php

namespace App\Services;

use App\Models\Workspace;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class WorkspaceService
{
    /**
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Workspace::paginate($perPage);
    }

    /**
     * @param  User  $user
     * @return array{owned: Collection, joined: Collection}
     */
    public function fetchMyWorkspaces(User $user): array
    {
        return [
            'owned' => $user->ownedWorkspaces()->get(),
            'joined' => $user->workspaces()->get(),
        ];
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
