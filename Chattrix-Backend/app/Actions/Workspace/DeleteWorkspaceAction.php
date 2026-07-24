<?php

namespace App\Actions\Workspace;

use App\Models\Workspace;

class DeleteWorkspaceAction
{
    /**
     * @param Workspace $workspace
     * @return void
     */
    public function handle(Workspace $workspace): void
    {
        $workspace->delete();
    }
}
