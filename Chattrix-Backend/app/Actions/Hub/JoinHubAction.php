<?php

namespace App\Actions\Hub;

use App\Models\Hub;
use App\Models\User;

class JoinHubAction
{
    /**
     * @param  Hub  $hub
     * @param  User  $user
     * @return bool
     */
    public function handle(Hub $hub, User $user): bool
    {
        if ($hub->owner_id === $user->id || $hub->members()->where('user_id', $user->id)->exists()) {
            return false;
        }

        $hub->members()->attach($user->id, ['joined_at' => now()]);

        return true;
    }
}
