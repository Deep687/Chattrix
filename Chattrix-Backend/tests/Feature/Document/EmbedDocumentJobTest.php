<?php

namespace Tests\Feature\Document;

use App\Enums\DocumentStatus;
use App\Jobs\EmbedDocumentJob;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Services\Ai\AiProviderException;
use App\Services\Ai\EmbeddingProvider;
use App\Services\ChunkingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeAiProvider;
use Tests\Support\MakesPdfs;
use Tests\TestCase;

class EmbedDocumentJobTest extends TestCase
{
    use MakesPdfs, RefreshDatabase;

    private FakeAiProvider $ai;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->ai = new FakeAiProvider;
        $this->app->instance(EmbeddingProvider::class, $this->ai);
    }

    public function test_a_pdf_becomes_ready_chunks_with_page_metadata(): void
    {
        $document = $this->document('policy.pdf', $this->pdf(['Annual leave is 20 days.', 'Remote work needs manager approval.']), 'application/pdf');

        $this->runJob($document);

        $document->refresh();
        $this->assertSame(DocumentStatus::Ready, $document->status);
        $this->assertNull($document->error);
        $this->assertSame(2, $document->chunk_count);

        [$first, $second] = DocumentChunk::orderBy('chunk_index')->get();
        $this->assertSame($document->workspace_id, $first->workspace_id);
        $this->assertSame([0, 1], [$first->chunk_index, $second->chunk_index]);
        $this->assertSame([1, 2], [$first->page, $second->page]);
        $this->assertStringContainsString('Annual leave is 20 days.', $first->content);
        $this->assertStringContainsString('Remote work needs manager approval.', $second->content);
        $this->assertGreaterThan(0, $first->token_count);
        $this->assertCount(config('services.gemini.embed_dimensions'), $first->embedding);
    }

    public function test_embedding_calls_are_batched(): void
    {
        $this->app->instance(ChunkingService::class, new ChunkingService(100, 10));
        config(['rag.embed_batch_size' => 4]);

        $text = implode("\n\n", array_map(fn ($i) => "Rule {$i} is about something specific and long enough.", range(1, 10)));
        $document = $this->document('rules.txt', $text);

        $this->runJob($document);

        $this->assertSame(10, $document->fresh()->chunk_count);
        $this->assertSame([4, 4, 2], array_map('count', $this->ai->embedBatches));
    }

    public function test_a_retry_replaces_chunks_instead_of_duplicating_them(): void
    {
        $document = $this->document('policy.txt', 'Annual leave is 20 days.');

        $this->runJob($document);
        $this->runJob($document);

        $this->assertSame(1, DocumentChunk::count());
        $this->assertSame(1, $document->fresh()->chunk_count);
    }

    public function test_a_provider_failure_propagates_so_the_queue_retries(): void
    {
        $document = $this->document('policy.txt', 'Annual leave is 20 days.');
        $this->ai->failEmbedding = true;

        $this->expectException(AiProviderException::class);

        $this->runJob($document);
    }

    public function test_exhausted_retries_mark_the_document_failed_without_leaking_detail(): void
    {
        $document = $this->document('policy.txt', 'Annual leave is 20 days.');

        (new EmbedDocumentJob($document))->failed(new AiProviderException('HTTP 429 quota exceeded for key abc'));

        $document->refresh();
        $this->assertSame(DocumentStatus::Failed, $document->status);
        $this->assertSame('Processing failed. Try uploading the file again.', $document->error);
        $this->assertDatabaseCount('document_chunks', 0);
    }

    public function test_a_failed_reindex_stops_the_old_chunks_being_searched(): void
    {
        $document = Document::factory()->ready()->create(['chunk_count' => 2]);
        DocumentChunk::factory()->count(2)->for($document)->sequence(['chunk_index' => 0], ['chunk_index' => 1])->create();

        (new EmbedDocumentJob($document))->failed(new AiProviderException('HTTP 503'));

        $this->assertSame(0, $document->chunks()->count());
        $this->assertSame(0, $document->refresh()->chunk_count);
        $this->assertSame(DocumentStatus::Failed, $document->status);
    }

    public function test_a_document_with_no_text_fails_permanently_with_a_reason(): void
    {
        $document = $this->document('blank.txt', "   \n\n  ");

        $this->runJob($document);

        $document->refresh();
        $this->assertSame(DocumentStatus::Failed, $document->status);
        $this->assertStringContainsString('No readable text', $document->error);
        $this->assertSame([], $this->ai->embedBatches);
    }

    public function test_a_corrupt_pdf_fails_permanently_with_a_reason(): void
    {
        $document = $this->document('broken.pdf', 'not really a pdf', 'application/pdf');

        $this->runJob($document);

        $this->assertSame(DocumentStatus::Failed, $document->fresh()->status);
        $this->assertStringContainsString('could not be read', $document->fresh()->error);
    }

    public function test_a_document_over_the_chunk_ceiling_fails_before_spending_quota(): void
    {
        $this->app->instance(ChunkingService::class, new ChunkingService(100, 10));
        config(['rag.max_chunks_per_document' => 3]);

        $text = implode("\n\n", array_map(fn ($i) => "Rule {$i} is about something specific and long enough.", range(1, 10)));
        $document = $this->document('long.txt', $text);

        $this->runJob($document);

        $this->assertSame(DocumentStatus::Failed, $document->fresh()->status);
        $this->assertSame([], $this->ai->embedBatches);
    }

    public function test_a_document_deleted_mid_job_is_left_alone(): void
    {
        $document = $this->document('policy.txt', 'Annual leave is 20 days.');
        $job = new EmbedDocumentJob($document);
        Document::whereKey($document->id)->delete();

        $this->app->call([$job, 'handle']);

        $this->assertDatabaseCount('document_chunks', 0);
    }

    public function test_the_reindex_command_rebuilds_a_workspaces_documents(): void
    {
        $document = $this->document('policy.txt', 'Annual leave is 20 days.');
        $other = $this->document('other.txt', 'Remote work needs approval.');

        $this->artisan('documents:reindex', ['--workspace' => $document->workspace_id, '--sync' => true])
            ->expectsOutput('Reindexed 1 document(s).')
            ->assertSuccessful();

        $this->assertSame(DocumentStatus::Ready, $document->fresh()->status);
        $this->assertSame(DocumentStatus::Pending, $other->fresh()->status);
    }

    private function document(string $filename, string $contents, string $mimeType = 'text/plain'): Document
    {
        $path = 'documents/'.$filename;
        Storage::disk('local')->put($path, $contents);

        return Document::factory()->create(['filename' => $filename, 'path' => $path, 'mime_type' => $mimeType]);
    }

    /**
     * Dispatched synchronously so `fail()` is handled the way a worker handles it.
     */
    private function runJob(Document $document): void
    {
        EmbedDocumentJob::dispatchSync($document);
    }
}
