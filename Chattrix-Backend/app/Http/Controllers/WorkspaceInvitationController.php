<?php

namespace App\Http\Controllers;

use App\Actions\WorkspaceInvitation\AcceptInvitationAction;
use App\Actions\WorkspaceInvitation\InviteToWorkspaceAction;
use App\Events\WorkspaceInvitationCreated;
use App\Http\Requests\WorkspaceInvitationRequest;
use App\Http\Resources\WorkspaceInvitationPreviewResource;
use App\Http\Resources\WorkspaceInvitationResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Traits\ApiResponser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class WorkspaceInvitationController extends Controller
{
    use ApiResponser;
    use AuthorizesRequests;

    public function __construct(
        protected InviteToWorkspaceAction $inviteToWorkspaceAction,
        protected AcceptInvitationAction $acceptInvitationAction
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

    /**
     * Describe an invitation to whoever holds the link.
     *
     * Unauthenticated on purpose: the invitee usually has no account yet, and being told which
     * workspace the link is for is what makes signing up worth doing. The token is unguessable,
     * so possession is the whole authorisation — but it buys only this preview, never membership.
     *
     * @param  string  $token  The plaintext token from the emailed link.
     * @return JsonResponse
     */
    public function show(string $token): JsonResponse
    {
        $invitation = WorkspaceInvitation::findByToken($token);

        if ($rejection = $this->rejectUnusable($invitation)) {
            return $rejection;
        }

        $invitation->load(['workspace', 'inviter']);

        return $this->success(
            new WorkspaceInvitationPreviewResource($invitation)
        );
    }

    /**
     * Redeem an invitation, joining the authenticated user to the workspace.
     *
     * The session email must match the invited address. Without that check a forwarded link
     * would hand tenant access to whoever opened it, and the invited address is the only
     * identity assertion the owner actually made.
     *
     * @param  string  $token  The plaintext token from the emailed link.
     * @return JsonResponse
     */
    public function accept(string $token): JsonResponse
    {
        $invitation = WorkspaceInvitation::findByToken($token);

        if ($rejection = $this->rejectUnusable($invitation)) {
            return $rejection;
        }

        $user = auth()->user();

        if ($user->email !== $invitation->email) {
            return $this->error(
                null,
                403,
                "This invitation was sent to {$invitation->email}. Sign in as that address to accept it."
            );
        }

        $workspace = $this->acceptInvitationAction->handle($invitation, $user);

        return $this->success(
            new WorkspaceResource($workspace),
            200,
            "You have joined {$workspace->name}."
        );
    }

    /**
     * Reject a token that cannot be redeemed, or null when it can.
     *
     * Used, expired and unknown are separated because the page wording differs — "ask for a new
     * link" only helps in two of the three. Nothing here is guessable, so distinguishing them
     * discloses nothing to someone who did not already hold the token.
     *
     * @param  WorkspaceInvitation|null  $invitation
     * @return JsonResponse|null
     */
    private function rejectUnusable(?WorkspaceInvitation $invitation): ?JsonResponse
    {
        if (! $invitation) {
            return $this->error(null, 404, 'This invitation link is not valid.');
        }

        if ($invitation->isAccepted()) {
            return $this->error(null, 410, 'This invitation has already been used.');
        }

        if ($invitation->isExpired()) {
            return $this->error(null, 410, 'This invitation has expired. Ask for a new one.');
        }

        return null;
    }
}
