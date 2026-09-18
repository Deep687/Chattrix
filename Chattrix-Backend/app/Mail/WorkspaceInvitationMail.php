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

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You have been invited to join a workspace',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.workspace-invitation',
        );
    }
}
