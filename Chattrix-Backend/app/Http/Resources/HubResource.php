<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Hub
 */
class HubResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'description'  => $this->description,
            'slug'         => $this->slug,
            'avatar'       => $this->avatar,
            'privacy_type' => $this->privacy_type,
            'owner_id'     => $this->owner_id,
            'created_at'   => $this->created_at,
        ];
    }
}
