<?php

namespace App\Actions\Hub;

use App\Models\Hub;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateHubAction
{
    /**
     * @param Hub $hub
     * @param array $data
     * @param UploadedFile|null $avatar
     * @return Hub
     */
    public function handle(Hub $hub, array $data, ?UploadedFile $avatar = null): Hub
    {
        if ($avatar) {
            if ($hub->avatar) {
                Storage::disk('public')->delete($hub->avatar);
            }
            $data['avatar'] = $avatar->store('avatars', 'public');
        }

        $hub->update($data);

        return $hub;
    }
}
