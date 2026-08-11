<?php

namespace App\Actions\WorkspaceInvitation;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;

/**
 * Issues a pending invitation for an email address to join a workspace.
 *
 * Re-inviting a still-pending address refreshes the row instead of failing. The token is
 * not set here — SendWorkspaceInvitationEmail generates it, so it never enters the queue.
 */
class InviteToWorkspaceAction
{
    /**
     * @param  User  $user
     * @param  Workspace  $workspace
     * @param  string  $email
     * @return WorkspaceInvitation With `token_hash` still null until the listener runs.
     */
    public function handle(User $user, Workspace $workspace, string $email): WorkspaceInvitation
    {
        $invitation = WorkspaceInvitation::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'email' => $email,
                'accepted_at' => null,
            ],
            [
                'invited_by' => $user->id,
                'expires_at' => now()->addHours((int) config('invitations.expiration_in_hours')),
            ]
        );

        return $invitation;
    }
}
