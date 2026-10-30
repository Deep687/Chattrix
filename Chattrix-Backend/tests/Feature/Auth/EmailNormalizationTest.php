<?php

namespace Tests\Feature\Auth;

use App\Mail\WorkspaceInvitationMail;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Emails are lowercased at every entry point, so an invite and the account it targets always match.
 */
class EmailNormalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_stores_the_email_lowercased(): void
    {
        Notification::fake();

        $this->postJson(route('auth.register'), [
            'name' => 'Jane',
            'email' => '  Jane@Acme.COM ',
            'password' => 'password-password-1',
            'password_confirmation' => 'password-password-1',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'jane@acme.com']);
    }

    public function test_registration_rejects_a_case_variant_of_an_existing_email(): void
    {
        User::factory()->create(['email' => 'jane@acme.com']);

        $this->postJson(route('auth.register'), [
            'name' => 'Jane',
            'email' => 'JANE@acme.com',
            'password' => 'password-password-1',
            'password_confirmation' => 'password-password-1',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_login_ignores_email_case(): void
    {
        User::factory()->create([
            'email' => 'jane@acme.com',
            'password' => bcrypt('password-password-1'),
        ]);

        $this->postJson(route('auth.login'), [
            'email' => 'Jane@Acme.com',
            'password' => 'password-password-1',
        ])->assertOk();
    }

    public function test_an_invitation_stores_the_email_lowercased(): void
    {
        Mail::fake();

        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

        Sanctum::actingAs($owner);

        $this->postJson(route('workspaces.invitations.store', $workspace), ['email' => 'Jane@Acme.com'])
            ->assertCreated()
            ->assertJsonPath('data.email', 'jane@acme.com');

        Mail::assertSent(WorkspaceInvitationMail::class, fn ($mail) => $mail->hasTo('jane@acme.com'));
    }
}
