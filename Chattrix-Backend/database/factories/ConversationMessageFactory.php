<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConversationMessage>
 */
class ConversationMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'role' => ConversationMessage::ROLE_USER,
            'content' => fake()->sentence(),
        ];
    }

    /**
     * An assistant reply that answered from one cited source.
     */
    public function assistant(string $content = 'Annual leave is 20 days [1].'): static
    {
        return $this->state([
            'role' => ConversationMessage::ROLE_ASSISTANT,
            'content' => $content,
            'sources' => [['n' => 1, 'document_id' => 1, 'filename' => 'handbook.pdf', 'page' => 2, 'excerpt' => 'Annual leave is 20 days.']],
            'cited' => [1],
            'answered' => true,
        ]);
    }
}
