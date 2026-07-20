<?php

namespace App\Services;

use App\Models\Hub;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class HubService
{
    /**
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Hub::paginate($perPage);
    }

    /**
     * @param  User  $user
     * @return array{owned: Collection, joined: Collection}
     */
    public function fetchMyHubs(User $user): array
    {
        return [
            'owned' => $user->ownedHubs()->get(),
            'joined' => $user->hubs()->get(),
        ];
    }

    /**
     * @param  Hub  $hub
     * @return Collection<int, User>
     */
    public function fetchMembers(Hub $hub): Collection
    {
        return $hub->members()
            ->get()
            ->each(fn (User $member) => $member->is_owner = $member->id === $hub->owner_id)
            ->sortByDesc('is_owner')
            ->values();
    }
}
