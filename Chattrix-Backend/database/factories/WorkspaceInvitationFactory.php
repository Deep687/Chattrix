<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WorkspaceInvitation>
 */
class WorkspaceInvitationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'email' => fake()->unique()->safeEmail(),
            'token_hash' => hash('sha256', Str::random(64)),
            'invited_by' => User::factory(),
            'expires_at' => now()->addHours((int) config('invitations.expiration_in_hours')),
            'accepted_at' => null,
            'accepted_by' => null,
        ];
    }

    /**
     * Address the invitation to a specific email.
     */
    public function for_email(string $email): static
    {
        return $this->state(['email' => $email]);
    }

    /**
     * An invitation whose window has already closed.
     */
    public function expired(): static
    {
        return $this->state(['expires_at' => now()->subHour()]);
    }

    /**
     * Store the hash of a caller-supplied token.
     *
     * The plaintext exists only in the emailed link, so a test that needs to follow that link
     * has to choose the token itself — there is nothing to read back off the row.
     */
    public function token(string $plain): static
    {
        return $this->state(['token_hash' => hash('sha256', $plain)]);
    }
}
