<?php

namespace App\Services;

use App\Models\Hub;
use Illuminate\Pagination\LengthAwarePaginator;

class HubService
{
    /**
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Hub::paginate($perPage);
    }
}
