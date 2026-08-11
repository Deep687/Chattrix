<?php

namespace App\Listeners;

use App\Events\WorkspaceInvitationCreated;
use App\Mail\WorkspaceInvitationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Mails the invite link, generating the token here rather than at invite time.
 *
 * Worker-side generation keeps the plaintext out of the queue payload — only the
 * invitation id travels, so `jobs`/`failed_jobs` never hold a usable token.
 */
class SendWorkspaceInvitationEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Wait for the inviting transaction to commit; the worker would otherwise
     * race it and find no row.
     */
    public bool $afterCommit = true;

    /**
     * Handle the event.
     *
     * @param  WorkspaceInvitationCreated  $event
     * @return void
     */
    public function handle(WorkspaceInvitationCreated $event): void
    {
        $invitation = $event->invitation;
        $user = $event->user;

        $token = Str::random(64);

        $invitation->update([
            'token_hash' => hash('sha256', $token),
        ]);

        $url = config('app.frontend_url').'/workspace/invitations/accept?token='.urlencode($token);

        Mail::to($invitation->email)->send(
            new WorkspaceInvitationMail(
                invitation: $invitation,
                user: $user,
                url: $url,
            )
        );
    }
}
