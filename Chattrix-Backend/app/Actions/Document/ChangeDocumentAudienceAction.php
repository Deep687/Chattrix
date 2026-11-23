<?php

namespace App\Actions\Document;

use App\Enums\DocumentAudience;
use App\Models\Document;
use Illuminate\Support\Facades\DB;

class ChangeDocumentAudienceAction
{
    /**
     * Re-stamp the document and all its chunks in one transaction, so no question can see the
     * two disagree. The row lock orders this against an in-flight `EmbedDocumentJob` write.
     *
     * @param  Document  $document
     * @param  DocumentAudience  $audience
     * @return Document
     */
    public function handle(Document $document, DocumentAudience $audience): Document
    {
        return DB::transaction(function () use ($document, $audience) {
            $locked = Document::whereKey($document->id)->lockForUpdate()->firstOrFail();

            $locked->update(['audience' => $audience]);
            $locked->chunks()->update(['audience' => $audience->value]);

            return $locked;
        });
    }
}
