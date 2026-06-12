<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Hub;

class HubPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Hub $hub): bool
    {
        if ($hub->privacy_type === 'public') {
            return true;
        }

        return $hub->owner_id === $user->id
            || $hub->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Hub $hub): bool
    {
        return $hub->owner_id === $user->id;
    }

    public function delete(User $user, Hub $hub): bool
    {
        return $hub->owner_id === $user->id;
    }

    public function restore(User $user, Hub $hub): bool
    {
        return false;
    }

    public function forceDelete(User $user, Hub $hub): bool
    {
        return false;
    }
}
