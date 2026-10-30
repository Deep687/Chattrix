<?php

namespace App\Actions\Document;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;

class DeleteDocumentAction
{
    /**
     * Delete the document, its chunks (by FK cascade) and then its file.
     *
     * Row first: if the file delete fails, an orphan file is harmless, whereas a row pointing at a
     * missing file would still be searchable.
     *
     * @param  Document  $document
     * @return void
     */
    public function handle(Document $document): void
    {
        $path = $document->path;

        $document->delete();

        Storage::disk('local')->delete($path);
    }
}
