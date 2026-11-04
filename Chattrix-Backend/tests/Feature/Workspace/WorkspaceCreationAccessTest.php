<?php

namespace Tests\Feature\Workspace;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * A workspace is a company, so only company registrants found one. Invited employees join only.
 */
class WorkspaceCreationAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, string>  $overrides
     * @return array<string, string>
     */
    private function registration(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane',
            'email' => 'jane@acme.com',
            'password' => 'password-password-1',
            'password_confirmation' => 'password-password-1',
        ], $overrides);
    }

    public function test_company_registration_creates_the_first_workspace_with_the_owner(): void
    {
        Notification::fake();

        $this->postJson(route('auth.register'), $this->registration(['company_name' => 'Acme']))
            ->assertCreated()
            ->assertJsonPath('data.user.can_create_workspaces', true);

        $user = User::whereEmail('jane@acme.com')->sole();
        $workspace = Workspace::where('name', 'Acme')->sole();

        $this->assertSame($user->id, $workspace->owner_id);
        $this->assertTrue($workspace->hasMemberWithRole($user, WorkspaceRole::Owner));
    }

    public function test_a_plain_signup_cannot_create_workspaces(): void
    {
        Notification::fake();

        $this->postJson(route('auth.register'), $this->registration())
            ->assertCreated()
            ->assertJsonPath('data.user.can_create_workspaces', false);

        $this->assertDatabaseCount('workspaces', 0);
    }

    public function test_the_ability_cannot_be_self_granted_at_signup(): void
    {
        Notification::fake();

        $this->postJson(route('auth.register'), $this->registration(['can_create_workspaces' => true]))
            ->assertCreated();

        $this->assertFalse(User::whereEmail('jane@acme.com')->sole()->can_create_workspaces);
    }

    public function test_an_invited_member_cannot_create_a_workspace(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/workspaces', ['name' => 'Side project'])->assertForbidden();

        $this->assertDatabaseCount('workspaces', 0);
    }

    public function test_a_company_registrant_can_create_further_workspaces(): void
    {
        Sanctum::actingAs(User::factory()->companyRegistrant()->create());

        $this->postJson('/api/workspaces', ['name' => 'Acme EU'])->assertCreated();
    }
}
