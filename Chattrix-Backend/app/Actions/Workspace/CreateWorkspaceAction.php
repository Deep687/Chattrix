<?php

namespace App\Actions\Workspace;

use App\Enums\WorkspaceRole;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;

class CreateWorkspaceAction
{
    /**
     * Create a workspace and enrol its creator as the owner.
     *
     * The creator is written to `workspace_user` as well as `workspaces.owner_id`, so the
     * owner always satisfies a plain membership check and authorisation never needs a
     * separate owner lookup.
     *
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

        $workspace->members()->attach($ownerId, [
            'role' => WorkspaceRole::Owner->value,
            'joined_at' => now(),
        ]);

        return $workspace;
    }
}
