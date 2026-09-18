<?php

namespace App\Events;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public WorkspaceInvitation $invitation,
        public User $user
    ) {}
}
