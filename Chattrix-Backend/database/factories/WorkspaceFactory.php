<?php

namespace Database\Factories;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Workspace>
 */
class WorkspaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * A workspace represents one tenant company, so the generated name reads like one.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'description' => fake()->sentence(),
            'avatar' => null,
            'owner_id' => User::factory(),
        ];
    }

    /**
     * Enrol the given user as the workspace owner, mirroring `CreateWorkspaceAction`.
     *
     * The owner is written to both `workspaces.owner_id` and the `workspace_user` pivot, so
     * tests exercise the same shape the application produces rather than a partial one.
     */
    public function ownedBy(User $user): static
    {
        return $this->state(['owner_id' => $user->id])
            ->afterCreating(fn (Workspace $workspace) => $workspace->members()->attach($user->id, [
                'role' => WorkspaceRole::Owner->value,
                'joined_at' => now(),
            ]));
    }

    /**
     * Enrol the given users as plain members.
     *
     * @param  array<int, User>  $users
     */
    public function withMembers(array $users): static
    {
        return $this->afterCreating(function (Workspace $workspace) use ($users) {
            foreach ($users as $user) {
                $workspace->members()->attach($user->id, [
                    'role' => WorkspaceRole::Member->value,
                    'joined_at' => now(),
                ]);
            }
        });
    }
}
