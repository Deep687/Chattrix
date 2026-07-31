<?php

namespace App\Actions\Workspace;

use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateWorkspaceAction
{
    /**
     * @param Workspace $workspace
     * @param array $data
     * @param UploadedFile|null $avatar
     * @return Workspace
     */
    public function handle(Workspace $workspace, array $data, ?UploadedFile $avatar = null): Workspace
    {
        if ($avatar) {
            if ($workspace->avatar) {
                Storage::disk('public')->delete($workspace->avatar);
            }
            $data['avatar'] = $avatar->store('avatars', 'public');
        }

        $workspace->update($data);

        return $workspace;
    }
}
