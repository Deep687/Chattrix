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
}
