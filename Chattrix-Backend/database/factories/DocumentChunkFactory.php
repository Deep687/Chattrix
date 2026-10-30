<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\DocumentChunk;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DocumentChunk>
 */
class DocumentChunkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * `workspace_id` is taken from the document, never generated: a chunk whose tenant differs
     * from its document's would make isolation tests pass for the wrong reason.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $content = fake()->paragraph();

        return [
            'document_id' => Document::factory(),
            'workspace_id' => fn (array $attributes) => Document::find($attributes['document_id'])->workspace_id,
            'chunk_index' => 0,
            'content' => $content,
            'embedding' => array_map(
                fn () => fake()->randomFloat(6, -1, 1),
                range(1, config('services.gemini.embed_dimensions')),
            ),
            'page' => 1,
            'token_count' => str_word_count($content),
            'char_start' => 0,
            'char_end' => strlen($content),
        ];
    }
}
