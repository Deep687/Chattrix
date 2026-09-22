<?php

namespace Tests\Feature\Auth;

use App\Mail\VerifyEmailMailable;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Covers the `next` that an invitee carries from the invite link into the verification email.
 *
 * Without it, verifying from the inbox lands on the dashboard and the invitation is stranded;
 * with it unguarded, our own mail would forward to whatever address a caller asked for.
 */
class VerificationNextTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Pull the frontend URL out of the mailable the notification builds.
     */
    private function verificationUrlFor(User $user, VerifyEmailNotification $notification): string
    {
        /** @var VerifyEmailMailable $mailable */
        $mailable = $notification->toMail($user);

        return $mailable->url;
    }

    public function test_registration_puts_next_in_the_verification_link(): void
    {
        Notification::fake();

        $next = '/workspace/invitations/accept?token=abc123';

        $this->postJson(route('auth.register'), [
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'password' => 'password-password-1',
            'password_confirmation' => 'password-password-1',
            'next' => $next,
        ])->assertCreated();

        $user = User::whereEmail('ada@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmailNotification::class,
            function (VerifyEmailNotification $notification) use ($user, $next) {
                $url = $this->verificationUrlFor($user, $notification);

                return str_contains($url, 'next='.urlencode($next));
            });
    }

    public function test_resend_puts_next_in_the_verification_link(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user);

        $next = '/workspace/invitations/accept?token=abc123';

        $this->postJson(route('verification.resend'), ['next' => $next])->assertOk();

        Notification::assertSentTo($user, VerifyEmailNotification::class,
            function (VerifyEmailNotification $notification) use ($user, $next) {
                return str_contains($this->verificationUrlFor($user, $notification), 'next='.urlencode($next));
            });
    }

    public function test_an_offsite_next_is_rejected(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user);

        $this->postJson(route('verification.resend'), ['next' => '//evil.test/steal'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('next');

        Notification::assertNothingSent();
    }
}
