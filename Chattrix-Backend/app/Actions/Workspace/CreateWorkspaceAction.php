<?php

namespace App\Actions\Workspace;

use App\Models\Workspace;
use Illuminate\Http\UploadedFile;

class CreateWorkspaceAction
{
    /**
     * @param  array  $data
     * @param  int  $ownerId
     * @param  UploadedFile|null  $avatar
     * @return Workspace
     */
    public function handle(array $data, int $ownerId, ?UploadedFile $avatar = null): Workspace
    {
        if ($avatar) {
            $data['avatar'] = $avatar->store('avatars', 'public');
        }

        $workspace = Workspace::create(array_merge($data, ['owner_id' => $ownerId]));

        $workspace->members()->attach($ownerId, ['joined_at' => now()]);

        return $workspace;
    }
}
