<?php

namespace App\Actions\Hub;

use App\Models\Hub;
use Illuminate\Http\UploadedFile;

class CreateHubAction
{
    /**
     * @param  array  $data
     * @param  int  $ownerId
     * @param  UploadedFile|null  $avatar
     * @return Hub
     */
    public function handle(array $data, int $ownerId, ?UploadedFile $avatar = null): Hub
    {
        if ($avatar) {
            $data['avatar'] = $avatar->store('avatars', 'public');
        }

        $hub = Hub::create(array_merge($data, ['owner_id' => $ownerId]));

        $hub->members()->attach($ownerId, ['joined_at' => now()]);

        return $hub;
    }
}
