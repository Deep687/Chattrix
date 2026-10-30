<?php

namespace App\Console\Commands;

use App\Jobs\EmbedDocumentJob;
use App\Models\Document;
use Illuminate\Console\Command;

/**
 * Re-embeds stored documents. Needed whenever chunking or the embedding model changes, since
 * existing chunks keep the old boundaries and vectors until their document is processed again.
 */
class ReindexDocuments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documents:reindex
                            {--workspace= : Only reindex this workspace id}
                            {--sync : Process now instead of queueing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Re-chunk and re-embed stored documents';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $documents = Document::query()
            ->when($this->option('workspace'), fn ($query, $id) => $query->where('workspace_id', $id))
            ->get();

        foreach ($documents as $document) {
            $this->option('sync')
                ? EmbedDocumentJob::dispatchSync($document)
                : EmbedDocumentJob::dispatch($document);
        }

        $this->info(($this->option('sync') ? 'Reindexed ' : 'Queued ').$documents->count().' document(s).');
    }
}
