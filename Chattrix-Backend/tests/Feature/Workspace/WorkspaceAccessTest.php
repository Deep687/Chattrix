<?php

namespace Tests\Feature\Workspace;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Locks down the tenant access model.
 *
 * Every workspace is private, so the property under test throughout is that access follows
 * membership and nothing else — no public flag, no discovery, no platform-wide listing. These
 * are the guardrails the document and retrieval layers get built on top of, and the foundation
 * the M3 cross-tenant isolation test extends.
 */
class WorkspaceAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_member_can_view_their_workspace(): void
    {
        $member = User::factory()->create();
        $workspace = Workspace::factory()->withMembers([$member])->create();

        Sanctum::actingAs($member);

        $this->getJson("/api/workspaces/{$workspace->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $workspace->id);
    }

    public function test_a_non_member_cannot_view_a_workspace(): void
    {
        $outsider = User::factory()->create();
        $workspace = Workspace::factory()->create();

        Sanctum::actingAs($outsider);

        $this->getJson("/api/workspaces/{$workspace->id}")->assertForbidden();
    }

    public function test_a_non_member_cannot_list_a_workspaces_members(): void
    {
        $outsider = User::factory()->create();
        $workspace = Workspace::factory()->create();

        Sanctum::actingAs($outsider);

        $this->getJson("/api/workspaces/{$workspace->id}/members")->assertForbidden();
    }

    public function test_the_listing_returns_only_the_callers_own_workspaces(): void
    {
        $user = User::factory()->create();
        $own = Workspace::factory()->ownedBy($user)->create();
        $joined = Workspace::factory()->withMembers([$user])->create();
        $foreign = Workspace::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/workspaces')->assertOk();

        // Asserted on `name` rather than `id` purely for the failure message: a leak reads as
        // "Globex Inc appeared in the listing" instead of "7 was in [3, 5, 7]".
        $names = collect($response->json('data'))->pluck('name');

        $this->assertContains($own->name, $names);
        $this->assertContains($joined->name, $names);
        $this->assertNotContains($foreign->name, $names, "Another tenant's workspace leaked into the listing.");
    }

    public function test_the_listing_returns_each_workspace_once_with_its_role(): void
    {
        $user = User::factory()->create();
        $owned = Workspace::factory()->ownedBy($user)->create();
        $joined = Workspace::factory()->withMembers([$user])->create();

        Sanctum::actingAs($user);

        $rows = collect($this->getJson('/api/workspaces')->assertOk()->json('data'));

        // The owner also holds a pivot row, so a listing that read ownership and membership
        // as separate buckets would return the owned workspace twice.
        $this->assertCount(2, $rows, 'The listing returned duplicates.');

        $this->assertSame(
            WorkspaceRole::Owner->value,
            $rows->firstWhere('id', $owned->id)['role']
        );
        $this->assertSame(
            WorkspaceRole::Member->value,
            $rows->firstWhere('id', $joined->id)['role']
        );
    }

    public function test_only_the_owner_can_update_a_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->ownedBy($owner)->withMembers([$member])->create();

        Sanctum::actingAs($member);
        $this->patchJson("/api/workspaces/{$workspace->id}", ['name' => 'Renamed by member'])
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->patchJson("/api/workspaces/{$workspace->id}", ['name' => 'Renamed by owner'])
            ->assertOk();

        $this->assertSame('Renamed by owner', $workspace->fresh()->name);
    }

    public function test_only_the_owner_can_delete_a_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->ownedBy($owner)->withMembers([$member])->create();

        Sanctum::actingAs($member);
        $this->deleteJson("/api/workspaces/{$workspace->id}")->assertForbidden();
        $this->assertDatabaseHas('workspaces', ['id' => $workspace->id]);

        Sanctum::actingAs($owner);
        $this->deleteJson("/api/workspaces/{$workspace->id}")->assertOk();
        $this->assertDatabaseMissing('workspaces', ['id' => $workspace->id]);
    }

    public function test_creating_a_workspace_enrols_the_creator_as_owner(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->postJson('/api/workspaces', [
            'name' => 'Acme',
            'description' => 'Acme internal policies',
        ])->assertCreated();

        $workspace = Workspace::where('name', 'Acme')->sole();

        $this->assertSame($user->id, $workspace->owner_id);
        $this->assertTrue(
            $workspace->hasMemberWithRole($user, WorkspaceRole::Owner),
            'The creator should hold the owner role in the workspace_user pivot.'
        );
    }

    public function test_a_privacy_setting_cannot_be_reintroduced_through_the_api(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->postJson('/api/workspaces', [
            'name' => 'Globex',
            'privacy_type' => 'public',
        ])->assertCreated();

        $this->assertArrayNotHasKey(
            'privacy_type',
            Workspace::where('name', 'Globex')->sole()->getAttributes(),
            'privacy_type was reintroduced; workspaces must be private-only.'
        );
    }

    public function test_there_is_no_self_serve_join_route(): void
    {
        $outsider = User::factory()->create();
        $workspace = Workspace::factory()->create();

        Sanctum::actingAs($outsider);

        $this->postJson("/api/workspaces/{$workspace->id}/join")->assertNotFound();
        $this->assertFalse($workspace->hasMember($outsider));
    }

    public function test_guests_are_rejected_before_any_workspace_check(): void
    {
        $workspace = Workspace::factory()->create();

        $this->getJson("/api/workspaces/{$workspace->id}")->assertUnauthorized();
        $this->getJson('/api/workspaces')->assertUnauthorized();
    }
}
