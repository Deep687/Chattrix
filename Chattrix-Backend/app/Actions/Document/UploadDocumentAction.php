<?php

namespace App\Actions\Document;

use App\Jobs\EmbedDocumentJob;
use App\Models\Document;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

class UploadDocumentAction
{
    /**
     * Store the file privately and queue it for embedding.
     *
     * Files go to the private `local` disk under a random name: the client's filename is display
     * text only, never a path. The job is dispatched after commit so a worker can't race the insert.
     *
     * @param  Workspace  $workspace
     * @param  User  $uploader
     * @param  UploadedFile  $file
     * @return Document
     */
    public function handle(Workspace $workspace, User $uploader, UploadedFile $file): Document
    {
        $path = $file->store("documents/{$workspace->id}", 'local');

        try {
            $document = $workspace->documents()->create([
                'uploader_id' => $uploader->id,
                'filename' => mb_substr(basename($file->getClientOriginalName()), 0, 255),
                'path' => $path,
                'mime_type' => $this->mimeType($file),
            ]);
        } catch (Throwable $e) {
            Storage::disk('local')->delete($path);

            throw $e;
        }

        EmbedDocumentJob::dispatch($document)->afterCommit();

        return $document;
    }

    /**
     * Sniffed type, not the client's claim. Markdown sniffs as text/plain, so the extension decides it.
     */
    private function mimeType(UploadedFile $file): string
    {
        if ($file->getMimeType() === 'application/pdf') {
            return 'application/pdf';
        }

        return strtolower($file->getClientOriginalExtension()) === 'md' ? 'text/markdown' : 'text/plain';
    }
}
