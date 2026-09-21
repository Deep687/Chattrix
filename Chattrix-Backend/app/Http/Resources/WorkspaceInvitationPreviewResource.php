<?php

namespace App\Http\Resources;

use App\Models\WorkspaceInvitation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The invitation as shown to someone holding the link but not yet signed in.
 *
 * Deliberately thinner than `WorkspaceInvitationResource`, which is an owner-facing admin view:
 * this one is served unauthenticated, so it carries only what the landing page must say — which
 * workspace, who invited, which address to sign in as. No member list, no ids beyond the
 * workspace's, and never the token.
 *
 * @mixin WorkspaceInvitation
 */
class WorkspaceInvitationPreviewResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'email' => $this->email,
            'expires_at' => $this->expires_at,
            'workspace' => [
                'id' => $this->workspace->id,
                'name' => $this->workspace->name,
                'avatar' => $this->workspace->avatar,
            ],
            'invited_by' => $this->inviter?->name,
        ];
    }
}
