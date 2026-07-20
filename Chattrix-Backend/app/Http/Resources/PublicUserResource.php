<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class PublicUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Deliberately omits email — this resource is served to any
     * authenticated user viewing someone else's profile, not just the
     * owner (unlike UserResource, which backs the /auth/me endpoint).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'created_at' => $this->created_at,
        ];
    }
}
