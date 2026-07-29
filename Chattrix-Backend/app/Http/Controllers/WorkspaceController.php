<?php

namespace App\Http\Controllers;

use App\Actions\Workspace\CreateWorkspaceAction;
use App\Actions\Workspace\DeleteWorkspaceAction;
use App\Actions\Workspace\UpdateWorkspaceAction;
use App\Http\Requests\CreateWorkspaceRequest;
use App\Http\Requests\UpdateWorkspaceRequest;
use App\Http\Resources\WorkspaceMemberResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use App\Services\WorkspaceService;
use App\Traits\ApiResponser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class WorkspaceController extends Controller
{
    use ApiResponser, AuthorizesRequests;

    /**
     * @param  WorkspaceService  $workspaceService
     * @param  CreateWorkspaceAction  $createWorkspaceAction
     * @param  UpdateWorkspaceAction  $updateWorkspaceAction
     * @param  DeleteWorkspaceAction  $deleteWorkspaceAction
     */
    public function __construct(
        private WorkspaceService $workspaceService,
        private CreateWorkspaceAction $createWorkspaceAction,
        private UpdateWorkspaceAction $updateWorkspaceAction,
        private DeleteWorkspaceAction $deleteWorkspaceAction,
    ) {}

    /**
     * List the workspaces the authenticated user belongs to.
     *
     * Scoped to the caller's memberships rather than paginating every workspace on the
     * platform: workspaces are private, so a tenant-wide index would leak the existence
     * of other companies even without exposing their contents.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Workspace::class);

        $workspaces = $this->workspaceService->fetchMyWorkspaces(Auth::user());

        return $this->success(WorkspaceResource::collection($workspaces), 200, 'Workspaces fetched successfully');
    }

    /**
     * Create a new workspace.
     *
     * @param  CreateWorkspaceRequest  $request
     * @return JsonResponse
     */
    public function store(CreateWorkspaceRequest $request): JsonResponse
    {
        $this->authorize('create', Workspace::class);

        $workspace = $this->createWorkspaceAction->handle(
            $request->validated(),
            Auth::id(),
            $request->file('avatar'),
        );

        return $this->success(new WorkspaceResource($workspace), 201, 'Workspace created successfully');
    }

    /**
     * Show a single workspace.
     *
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function show(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        return $this->success(new WorkspaceResource($workspace), 200, 'Workspace fetched successfully');
    }

    /**
     * Update an existing workspace.
     *
     * @param  UpdateWorkspaceRequest  $request
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $workspace = $this->updateWorkspaceAction->handle(
            $workspace,
            $request->validated(),
            $request->file('avatar'),
        );

        return $this->success(new WorkspaceResource($workspace), 200, 'Workspace updated successfully');
    }

    /**
     * Delete a workspace.
     *
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function destroy(Workspace $workspace): JsonResponse
    {
        $this->authorize('delete', $workspace);

        $this->deleteWorkspaceAction->handle($workspace);

        return $this->success(null, 200, 'Workspace deleted successfully');
    }

    /**
     * List a workspace's members.
     *
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function members(Workspace $workspace): JsonResponse
    {
        $this->authorize('view', $workspace);

        $members = $this->workspaceService->fetchMembers($workspace);

        return $this->success(WorkspaceMemberResource::collection($members), 200, 'Members fetched successfully');
    }
}
