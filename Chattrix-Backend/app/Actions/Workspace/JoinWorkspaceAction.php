<?php

namespace App\Actions\Workspace;

use App\Models\Workspace;
use App\Models\User;

class JoinWorkspaceAction
{
    /**
     * @param  Workspace  $workspace
     * @param  User  $user
     * @return bool
     */
    public function handle(Workspace $workspace, User $user): bool
    {
        if ($workspace->owner_id === $user->id || $workspace->members()->where('user_id', $user->id)->exists()) {
            return false;
        }

        $workspace->members()->attach($user->id, ['joined_at' => now()]);

        return true;
    }
}
