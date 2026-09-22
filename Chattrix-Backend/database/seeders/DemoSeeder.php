<?php

namespace Database\Seeders;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Populates a recognisable demo tenant set for screenshots and manual QA.
 *
 * Idempotent: every row is matched on a natural key, so re-running refreshes the demo
 * rather than duplicating it. Safe to run against an existing dev database.
 */
class DemoSeeder extends Seeder
{
    /**
     * The demo account that owns Acme and belongs to Globex.
     *
     * @var string
     */
    private const DEMO_EMAIL = 'demo@chattrix.test';

    /**
     * Seed two workspaces, their rosters, and one pending invitation.
     */
    public function run(): void
    {
        $demo = $this->user(self::DEMO_EMAIL, 'Priya Raman');

        $acme = $this->workspace(
            'Acme Corporation',
            'HR handbook, expense policy, and the 2026 code of conduct.',
            $demo,
        );

        $globex = $this->workspace(
            'Globex Industries',
            'IT security standards and vendor compliance documentation.',
            $this->user('rhys.calder@chattrix.test', 'Rhys Calder'),
        );

        $this->join($acme, $this->user('mei.tanaka@chattrix.test', 'Mei Tanaka'));
        $this->join($acme, $this->user('daniel.osei@chattrix.test', 'Daniel Osei'));
        $this->join($globex, $demo);
        $this->join($globex, $this->user('sofia.brandt@chattrix.test', 'Sofia Brandt'));

        $this->invite($acme, 'jonas.weber@chattrix.test', $demo);
    }

    /**
     * Find or create a demo user with a known password.
     *
     * @param  string  $email  The address used as the natural key.
     * @param  string  $name  Display name shown in the roster.
     * @return User The persisted user.
     */
    private function user(string $email, string $name): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * Find or create a workspace and register its owner in the membership pivot.
     *
     * @param  string  $name  The workspace name, used as the natural key with the owner.
     * @param  string  $description  Copy shown on the card and detail header.
     * @param  User  $owner  The owning user.
     * @return Workspace The persisted workspace.
     */
    private function workspace(string $name, string $description, User $owner): Workspace
    {
        $workspace = Workspace::firstOrCreate(
            ['name' => $name, 'owner_id' => $owner->id],
            ['description' => $description],
        );

        $workspace->members()->syncWithoutDetaching([
            $owner->id => ['role' => WorkspaceRole::Owner->value, 'joined_at' => now()],
        ]);

        return $workspace;
    }

    /**
     * Add a user to a workspace as an ordinary member.
     *
     * @param  Workspace  $workspace  The workspace to join.
     * @param  User  $user  The joining user.
     */
    private function join(Workspace $workspace, User $user): void
    {
        $workspace->members()->syncWithoutDetaching([
            $user->id => ['role' => WorkspaceRole::Member->value, 'joined_at' => now()],
        ]);
    }

    /**
     * Issue a pending invitation so the owner view has something in its "Pending" list.
     *
     * @param  Workspace  $workspace  The inviting workspace.
     * @param  string  $email  The invitee's address.
     * @param  User  $invitedBy  The owner issuing the invitation.
     */
    private function invite(Workspace $workspace, string $email, User $invitedBy): void
    {
        WorkspaceInvitation::firstOrCreate(
            ['workspace_id' => $workspace->id, 'email' => $email, 'accepted_at' => null],
            [
                'token_hash' => hash('sha256', Str::random(40)),
                'invited_by' => $invitedBy->id,
                'expires_at' => now()->addDays(7),
            ],
        );
    }
}
