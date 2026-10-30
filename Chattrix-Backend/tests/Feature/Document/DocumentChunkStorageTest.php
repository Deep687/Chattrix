<?php

namespace Tests\Feature\Document;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Locks down the storage shape the embed job and retrieval query rely on.
 */
class DocumentChunkStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_embedding_round_trips_through_pgvector(): void
    {
        $chunk = DocumentChunk::factory()->create();

        $stored = $chunk->fresh()->embedding;

        $this->assertCount(config('services.gemini.embed_dimensions'), $stored);
        $this->assertEqualsWithDelta($chunk->embedding, $stored, 0.00001);
    }

    public function test_a_chunk_inherits_its_documents_workspace(): void
    {
        $document = Document::factory()->create();

        $chunk = DocumentChunk::factory()->for($document)->create();

        $this->assertSame($document->workspace_id, $chunk->workspace_id);
    }

    public function test_the_same_chunk_cannot_be_stored_twice(): void
    {
        $document = Document::factory()->create();
        DocumentChunk::factory()->for($document)->create(['chunk_index' => 0]);

        $this->expectException(QueryException::class);

        DocumentChunk::factory()->for($document)->create(['chunk_index' => 0]);
    }

    public function test_a_wrong_width_embedding_is_rejected(): void
    {
        $this->expectException(QueryException::class);

        DocumentChunk::factory()->create(['embedding' => array_fill(0, 3072, 0.1)]);
    }

    public function test_deleting_a_document_deletes_its_chunks(): void
    {
        $document = Document::factory()->create();
        DocumentChunk::factory()->for($document)->create();

        $document->delete();

        $this->assertDatabaseCount('document_chunks', 0);
    }

    public function test_documents_survive_their_uploader_being_deleted(): void
    {
        $uploader = User::factory()->create();
        $document = Document::factory()->for($uploader, 'uploader')->create();

        $uploader->delete();

        $this->assertNull($document->fresh()->uploader_id);
    }

    public function test_a_new_document_starts_pending(): void
    {
        $this->assertSame(DocumentStatus::Pending, (new Document)->status);
    }
}
