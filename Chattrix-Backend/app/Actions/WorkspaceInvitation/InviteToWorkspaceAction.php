<?php

namespace App\Actions\WorkspaceInvitation;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Support\Str;

/**
 * Issues a pending invitation for an email address to join a workspace.
 *
 * Re-inviting a still-pending address rotates the token instead of failing.
 */
class InviteToWorkspaceAction
{
    /**
     * @param  User  $user
     * @param  Workspace  $workspace
     * @param  string  $email
     * @return WorkspaceInvitation With `plainTextToken` set; the column holds only a hash.
     */
    public function handle(User $user, Workspace $workspace, string $email): WorkspaceInvitation
    {
        $token = Str::random(64);

        $invitation = WorkspaceInvitation::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'email' => $email,
                'accepted_at' => null,
            ],
            [
                'token_hash' => hash('sha256', $token),
                'invited_by' => $user->id,
                'expires_at' => now()->addHours((int) config('invitations.expiration_in_hours')),
            ]
        );

        $invitation->plainTextToken = $token;

        return $invitation;
    }
}
