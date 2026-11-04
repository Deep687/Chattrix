<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

/**
 * A conversation belongs to the employee who started it, and only while they are still a member of
 * its workspace. Ownership of the workspace grants nothing here: no one reads another person's
 * questions to the HR assistant.
 */
class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->user_id === $user->id && $conversation->workspace->hasMember($user);
    }

    public function delete(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }
}
