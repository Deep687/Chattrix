<?php

namespace App\Policies;

use App\Models\Workspace;
use App\Models\User;

class WorkspacePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Workspace $workspace): bool
    {
        if ($workspace->privacy_type === 'public') {
            return true;
        }

        return $workspace->owner_id === $user->id
            || $workspace->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function join(User $user, Workspace $workspace): bool
    {
        return $workspace->privacy_type === 'public';
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
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
