<?php

namespace App\Jobs;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Services\Ai\EmbeddingProvider;
use App\Services\ChunkingService;
use App\Services\DocumentProcessingException;
use App\Services\DocumentTextExtractor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Parse → chunk → embed → store, for one document.
 *
 * Safe to retry: every API call happens before the write, and the write replaces the document's
 * chunks in one transaction, so a rerun never duplicates chunks or leaves half a document searchable.
 */
class EmbedDocumentJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    // Deleted before the worker picked it up: nothing left to embed.
    public bool $deleteWhenMissingModels = true;

    /**
     * @param  Document  $document
     */
    public function __construct(public Document $document) {}

    /**
     * Seconds to wait before each retry, long enough for a provider rate limit to reset.
     *
     * @return list<int>
     */
    public function backoff(): array
    {
        return [30, 120];
    }

    /**
     * @param  DocumentTextExtractor  $extractor
     * @param  ChunkingService  $chunker
     * @param  EmbeddingProvider  $embedder
     * @return void
     */
    public function handle(DocumentTextExtractor $extractor, ChunkingService $chunker, EmbeddingProvider $embedder): void
    {
        $this->document->update(['status' => DocumentStatus::Processing, 'error' => null]);

        try {
            $chunks = $chunker->chunk($extractor->extract($this->document));
            $this->guardSize($chunks);
        } catch (DocumentProcessingException $e) {
            // Retrying cannot fix an unreadable file; fail now instead of three times.
            $this->fail($e);

            return;
        }

        $vectors = [];

        foreach (array_chunk($chunks, config('rag.embed_batch_size')) as $batch) {
            array_push($vectors, ...$embedder->embedDocuments(array_column($batch, 'content')));
        }

        $this->store($chunks, $vectors);
    }

    /**
     * Runs once all retries are spent. Chunks from an earlier successful run are dropped too, so a
     * failed re-index can't leave a document members no longer see still being cited.
     *
     * @param  Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception): void
    {
        DB::transaction(function () use ($exception) {
            DocumentChunk::where('document_id', $this->document->id)->delete();

            Document::whereKey($this->document->id)->update([
                'status' => DocumentStatus::Failed,
                'chunk_count' => 0,
                'error' => $exception instanceof DocumentProcessingException
                    ? $exception->getMessage()
                    : 'Processing failed. Try uploading the file again.',
            ]);
        });
    }

    /**
     * @param  list<array{content: string}>  $chunks
     *
     * @throws DocumentProcessingException
     */
    private function guardSize(array $chunks): void
    {
        if ($chunks === []) {
            throw new DocumentProcessingException('No readable text found. Scanned PDFs need OCR, which is not supported yet.');
        }

        if (count($chunks) > config('rag.max_chunks_per_document')) {
            throw new DocumentProcessingException('This document is too long to index. Split it into smaller files.');
        }
    }

    /**
     * @param  list<array{content: string, page: ?int, char_start: int, char_end: int, token_count: int}>  $chunks
     * @param  list<list<float>>  $vectors
     */
    private function store(array $chunks, array $vectors): void
    {
        DB::transaction(function () use ($chunks, $vectors) {
            // The lock serialises against a concurrent delete; a vanished row means stop quietly.
            $document = Document::whereKey($this->document->id)->lockForUpdate()->first();

            if (! $document) {
                return;
            }

            $document->chunks()->delete();

            $now = now();
            $rows = [];

            foreach ($chunks as $index => $chunk) {
                $rows[] = [
                    ...$chunk,
                    'document_id' => $document->id,
                    'workspace_id' => $document->workspace_id,
                    'chunk_index' => $index,
                    'embedding' => '['.implode(',', $vectors[$index]).']',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            foreach (array_chunk($rows, 200) as $batch) {
                DocumentChunk::insert($batch);
            }

            $document->update([
                'status' => DocumentStatus::Ready,
                'error' => null,
                'chunk_count' => count($rows),
            ]);
        });
    }
}
