<?php

namespace App\Actions\WorkspaceInvitation;

use App\Actions\Workspace\JoinWorkspaceAction;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Support\Facades\DB;

/**
 * Redeems a pending invitation, granting the user membership of the workspace.
 *
 * The row is re-read under a lock inside the transaction rather than trusting the instance the
 * controller resolved: two clicks on the same link would otherwise both pass the pending check
 * and attach twice. Whichever request takes the lock second sees `accepted_at` already set and
 * grants nothing.
 */
class AcceptInvitationAction
{
    public function __construct(
        protected JoinWorkspaceAction $joinWorkspaceAction
    ) {}

    /**
     * @param  WorkspaceInvitation  $invitation
     * @param  User  $user  The authenticated invitee, already checked against the invited address.
     * @return Workspace The workspace joined, for redirecting the client.
     */
    public function handle(WorkspaceInvitation $invitation, User $user): Workspace
    {
        return DB::transaction(function () use ($invitation, $user) {
            $locked = WorkspaceInvitation::whereKey($invitation->getKey())
                ->lockForUpdate()
                ->first();

            if ($locked && ! $locked->isAccepted()) {
                $locked->update([
                    'accepted_at' => now(),
                    'accepted_by' => $user->id,
                ]);

                $this->joinWorkspaceAction->handle($locked->workspace, $user);
            }

            return $invitation->workspace()->firstOrFail();
        });
    }
}
