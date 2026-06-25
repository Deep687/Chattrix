<?php

namespace App\Actions\Hub;

use App\Models\Hub;

class DeleteHubAction
{
    /**
     * @param Hub $hub
     * @return void
     */
    public function handle(Hub $hub): void
    {
        $hub->delete();
    }
}
