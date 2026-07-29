<?php

namespace App\Http\Resources;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Workspace
 */
class WorkspaceResource extends JsonResource
{
    /**
     * The caller's tenant role is included only when the workspace was loaded through the
     * membership pivot, which is the listing case. On a freshly created workspace there is
     * no pivot to read, so the key is omitted rather than guessed at.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'avatar' => $this->avatar,
            'owner_id' => $this->owner_id,
            'role' => $this->whenPivotLoaded('workspace_user', fn () => $this->pivot->role),
            'created_at' => $this->created_at,
        ];
    }
}
