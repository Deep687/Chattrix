<?php

namespace App\Http\Controllers;

use App\Actions\WorkspaceInvitation\InviteToWorkspaceAction;
use App\Events\WorkspaceInvitationCreated;
use App\Http\Requests\WorkspaceInvitationRequest;
use App\Http\Resources\WorkspaceInvitationResource;
use App\Models\Workspace;
use App\Traits\ApiResponser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class WorkspaceInvitationController extends Controller
{
    use ApiResponser;
    use AuthorizesRequests;

    public function __construct(
        protected InviteToWorkspaceAction $inviteToWorkspaceAction
    ) {}

    /**
     * List the invitations still awaiting acceptance.
     *
     * Owners only — the pending list is administrative, not part of the roster.
     *
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function index(Workspace $workspace): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        $invitations = $workspace->invitations()
            ->whereNull('accepted_at')
            ->latest()
            ->get();

        return $this->success(
            WorkspaceInvitationResource::collection($invitations)
        );
    }

    /**
     * Invite an email address to this workspace.
     *
     * The token is absent from the response on purpose — it belongs in the emailed link only.
     *
     * @param  WorkspaceInvitationRequest  $request
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function store(WorkspaceInvitationRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        $invitation = $this->inviteToWorkspaceAction->handle(
            auth()->user(),
            $workspace,
            $request->validated('email')
        );

        WorkspaceInvitationCreated::dispatch(
            $invitation,
            auth()->user(),
        );

        return $this->success(
            new WorkspaceInvitationResource($invitation),
            201,
            'Your invitation is in progress.'
        );
    }
}
