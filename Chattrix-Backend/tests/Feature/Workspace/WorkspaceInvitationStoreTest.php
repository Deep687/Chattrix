<?php

namespace Tests\Feature\Workspace;

use App\Actions\Workspace\JoinWorkspaceAction;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Covers issuing an invitation: owner-only, and never to someone already in the workspace.
 */
class WorkspaceInvitationStoreTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->owner = User::factory()->create(['email' => 'owner@acme.com']);
        $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
        app(JoinWorkspaceAction::class)->handle($this->workspace, $this->owner);
    }

    public function test_the_owner_can_invite_a_new_address(): void
    {
        Sanctum::actingAs($this->owner);

        $this->postJson(route('workspaces.invitations.store', $this->workspace), ['email' => 'jane@acme.com'])
            ->assertCreated();
    }

    public function test_an_existing_member_cannot_be_invited(): void
    {
        $member = User::factory()->create(['email' => 'jane@acme.com']);
        app(JoinWorkspaceAction::class)->handle($this->workspace, $member);

        Sanctum::actingAs($this->owner);

        $this->postJson(route('workspaces.invitations.store', $this->workspace), ['email' => 'Jane@Acme.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('workspace_invitations', 0);
    }

    public function test_the_owner_cannot_invite_themselves(): void
    {
        Sanctum::actingAs($this->owner);

        $this->postJson(route('workspaces.invitations.store', $this->workspace), ['email' => 'owner@acme.com'])
            ->assertUnprocessable();
    }

    public function test_a_member_of_another_workspace_can_still_be_invited(): void
    {
        $elsewhere = User::factory()->create(['email' => 'jane@acme.com']);
        app(JoinWorkspaceAction::class)->handle(Workspace::factory()->create(), $elsewhere);

        Sanctum::actingAs($this->owner);

        $this->postJson(route('workspaces.invitations.store', $this->workspace), ['email' => 'jane@acme.com'])
            ->assertCreated();
    }

    public function test_a_non_owner_is_refused_before_membership_is_checked(): void
    {
        $member = User::factory()->create();
        app(JoinWorkspaceAction::class)->handle($this->workspace, $member);

        Sanctum::actingAs($member);

        // 403, not 422: a 422 would tell a non-owner that owner@acme.com belongs here.
        $this->postJson(route('workspaces.invitations.store', $this->workspace), ['email' => 'owner@acme.com'])
            ->assertForbidden();
    }
}
