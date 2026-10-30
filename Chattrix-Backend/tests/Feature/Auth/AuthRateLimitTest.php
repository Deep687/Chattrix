<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Auth limits key on the email being attempted, not the IP alone: a whole office shares one
 * address, and a per-IP bucket would let a few colleagues lock everyone else out.
 */
class AuthRateLimitTest extends TestCase
{
    use RefreshDatabase;

    private function attemptLogin(string $email): int
    {
        return $this->postJson(route('auth.login'), [
            'email' => $email,
            'password' => 'wrong-password',
        ])->status();
    }

    public function test_one_email_is_capped_at_six_attempts_a_minute(): void
    {
        foreach (range(1, 6) as $attempt) {
            $this->assertSame(401, $this->attemptLogin('jane@acme.com'));
        }

        $this->assertSame(429, $this->attemptLogin('jane@acme.com'));
    }

    public function test_the_cap_ignores_email_case(): void
    {
        foreach (range(1, 6) as $attempt) {
            $this->attemptLogin('jane@acme.com');
        }

        $this->assertSame(429, $this->attemptLogin('Jane@Acme.com'));
    }

    public function test_colleagues_on_the_same_ip_do_not_share_a_bucket(): void
    {
        foreach (range(1, 6) as $attempt) {
            $this->attemptLogin('jane@acme.com');
        }

        $colleague = User::factory()->create([
            'email' => 'raj@acme.com',
            'password' => bcrypt('password-password-1'),
        ]);

        $this->postJson(route('auth.login'), [
            'email' => $colleague->email,
            'password' => 'password-password-1',
        ])->assertOk();
    }

    public function test_one_ip_cannot_spray_unlimited_emails(): void
    {
        // Register shares the `auth` limiter and fails validation fast; failed logins are
        // timeboxed, so sixty of them would add seconds to the suite.
        foreach (range(1, 60) as $attempt) {
            $this->postJson(route('auth.register'), ['email' => "user{$attempt}@acme.com"]);
        }

        $this->assertSame(429, $this->attemptLogin('fresh@acme.com'));
    }
}
