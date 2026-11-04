<?php

namespace App\Actions\Workspace;

use App\Models\Workspace;
use Illuminate\Support\Facades\Storage;

class DeleteWorkspaceAction
{
    /**
     * Delete the workspace (rows cascade) and then its uploaded files, which no FK can reach.
     *
     * @param  Workspace  $workspace
     * @return void
     */
    public function handle(Workspace $workspace): void
    {
        $workspace->delete();

        Storage::disk('local')->deleteDirectory("documents/{$workspace->id}");
    }
}
