<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WorkspaceInvitationController extends Controller
{
    use AuthorizesRequests;
    public function store(Request $request, Workspace $workspace)
    {
        $this->authorize('manageMembers', $workspace);

        return response()->json('Controller called');
    }
}
