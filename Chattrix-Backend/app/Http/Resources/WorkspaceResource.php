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
     * `is_owner` is derived from `owner_id` rather than read from the `workspace_user` pivot.
     * The pivot only travels on models fetched through the membership relation, so a pivot-based
     * role was absent on `show` and on a freshly created workspace — present sometimes is worse
     * than never. No policy reads the pivot role: every ability resolves to `hasMember()` or an
     * `owner_id` comparison, so this is the whole access distinction the client needs.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'avatar' => $this->avatar,
            'owner_id' => $this->owner_id,
            'is_owner' => $this->owner_id === $request->user()->id,
            'created_at' => $this->created_at,
        ];
    }
}
