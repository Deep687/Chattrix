<?php

namespace App\Mail;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public WorkspaceInvitation $invitation,
        public User $user,
        public string $url,
    ) {}

    /**
     * Names the inviter and the workspace, so the invite is recognisable from the inbox list alone.
     *
     * @return Envelope
     */
    public function envelope(): Envelope
    {
        $workspace = $this->invitation->workspace?->name;

        return new Envelope(
            subject: $workspace
                ? "{$this->user->name} invited you to {$workspace} on Chattrix"
                : "{$this->user->name} invited you to a workspace on Chattrix",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.workspace-invitation',
            text: 'emails.workspace-invitation-text',
        );
    }
}
