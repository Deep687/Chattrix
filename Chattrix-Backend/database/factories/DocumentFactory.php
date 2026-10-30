<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = fake()->slug(3).'.pdf';

        return [
            'workspace_id' => Workspace::factory(),
            'uploader_id' => User::factory(),
            'filename' => $filename,
            'path' => 'documents/'.$filename,
            'mime_type' => 'application/pdf',
            'status' => DocumentStatus::Pending,
            'error' => null,
            'chunk_count' => 0,
        ];
    }

    /**
     * A document whose embed job has finished.
     */
    public function ready(): static
    {
        return $this->state(['status' => DocumentStatus::Ready]);
    }

    /**
     * A document whose embed job failed, with the reason the UI would show.
     */
    public function failed(): static
    {
        return $this->state([
            'status' => DocumentStatus::Failed,
            'error' => 'The file could not be read.',
        ]);
    }
}
