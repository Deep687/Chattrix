<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Covers redemption of an emailed invite link.
 *
 * Membership is the only thing that grants tenant access, and this flow is the one path that
 * writes it from outside the workspace. The properties under test are that the token alone
 * cannot grant access to the wrong person, and that it cannot be spent twice.
 */
class WorkspaceInvitationAcceptTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Build a pending invitation and hand back the plaintext token from the link.
     *
     * @return array{0: WorkspaceInvitation, 1: string}
     */
    private function inviteTo(Workspace $workspace, string $email): array
    {
        $token = Str::random(64);

        $invitation = WorkspaceInvitation::factory()
            ->for_email($email)
            ->token($token)
            ->create(['workspace_id' => $workspace->id]);

        return [$invitation, $token];
    }

    public function test_the_preview_describes_the_workspace_without_authentication(): void
    {
        $workspace = Workspace::factory()->create(['name' => 'Acme']);
        [, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        $this->getJson("/api/workspaces/invitations/{$token}")
            ->assertOk()
            ->assertJsonPath('data.workspace.name', 'Acme')
            ->assertJsonPath('data.email', 'jane@acme.com');
    }

    public function test_the_preview_never_returns_the_token(): void
    {
        $workspace = Workspace::factory()->create();
        [, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        $this->getJson("/api/workspaces/invitations/{$token}")
            ->assertOk()
            ->assertJsonMissing(['token' => $token])
            ->assertJsonMissingPath('data.token_hash');
    }

    public function test_an_unknown_token_is_rejected(): void
    {
        $this->getJson('/api/workspaces/invitations/'.str_repeat('a', 64))
            ->assertNotFound();
    }

    public function test_an_expired_invitation_cannot_be_previewed_or_accepted(): void
    {
        $workspace = Workspace::factory()->create();
        $token = Str::random(64);

        WorkspaceInvitation::factory()
            ->for_email('jane@acme.com')
            ->expired()
            ->token($token)
            ->create(['workspace_id' => $workspace->id]);

        $this->getJson("/api/workspaces/invitations/{$token}")->assertStatus(410);

        Sanctum::actingAs(User::factory()->create(['email' => 'jane@acme.com']));

        $this->postJson("/api/workspaces/invitations/{$token}/accept")->assertStatus(410);
        $this->assertDatabaseCount('workspace_user', 0);
    }

    public function test_the_invited_user_joins_the_workspace(): void
    {
        $user = User::factory()->create(['email' => 'jane@acme.com']);
        $workspace = Workspace::factory()->create();
        [$invitation, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        Sanctum::actingAs($user);

        $this->postJson("/api/workspaces/invitations/{$token}/accept")
            ->assertOk()
            ->assertJsonPath('data.id', $workspace->id);

        $this->assertTrue($workspace->fresh()->hasMember($user));
        $this->assertDatabaseHas('workspace_invitations', [
            'id' => $invitation->id,
            'accepted_by' => $user->id,
        ]);
    }

    public function test_a_forwarded_link_cannot_be_redeemed_by_another_address(): void
    {
        $outsider = User::factory()->create(['email' => 'mallory@globex.com']);
        $workspace = Workspace::factory()->create();
        [, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        Sanctum::actingAs($outsider);

        $this->postJson("/api/workspaces/invitations/{$token}/accept")
            ->assertForbidden();

        $this->assertFalse($workspace->fresh()->hasMember($outsider));
        $this->assertDatabaseCount('workspace_user', 0);
    }

    public function test_an_invitation_cannot_be_spent_twice(): void
    {
        $user = User::factory()->create(['email' => 'jane@acme.com']);
        $workspace = Workspace::factory()->create();
        [, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        Sanctum::actingAs($user);

        $this->postJson("/api/workspaces/invitations/{$token}/accept")->assertOk();
        $this->postJson("/api/workspaces/invitations/{$token}/accept")->assertStatus(410);

        $this->assertDatabaseCount('workspace_user', 1);
    }

    public function test_accepting_requires_authentication(): void
    {
        $workspace = Workspace::factory()->create();
        [, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        $this->postJson("/api/workspaces/invitations/{$token}/accept")
            ->assertUnauthorized();

        $this->assertDatabaseCount('workspace_user', 0);
    }

    public function test_an_unverified_user_cannot_accept(): void
    {
        $user = User::factory()->unverified()->create(['email' => 'jane@acme.com']);
        $workspace = Workspace::factory()->create();
        [, $token] = $this->inviteTo($workspace, 'jane@acme.com');

        Sanctum::actingAs($user);

        $this->postJson("/api/workspaces/invitations/{$token}/accept")->assertForbidden();
        $this->assertDatabaseCount('workspace_user', 0);
    }
}
