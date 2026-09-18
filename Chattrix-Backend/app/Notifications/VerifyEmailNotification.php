<?php

namespace App\Notifications;

use App\Mail\VerifyEmailMailable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

/**
 * Sends the email-verification link, pointed at the frontend instead of a Laravel route.
 */
class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): Mailable
    {
        return (new VerifyEmailMailable(
            name: $notifiable->name,
            url: $this->verificationUrl($notifiable),
        ))->to($notifiable->getEmailForVerification())
            ->subject('Verify your email address');
    }

    /**
     * Build the frontend verification URL from a signed backend route.
     */
    protected function verificationUrl(object $notifiable): string
    {
        $id = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(config('auth.verification.expire', 60)),
            ['id' => $id, 'hash' => $hash]
        );

        parse_str(parse_url($signedUrl, PHP_URL_QUERY), $query);

        $query = array_merge(['id' => $id, 'hash' => $hash], $query);

        return rtrim(config('app.frontend_url'), '/').'/verify-email?'.http_build_query($query);
    }
}
