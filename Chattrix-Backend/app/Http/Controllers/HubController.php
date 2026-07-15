<?php

namespace App\Http\Controllers;

use App\Actions\Hub\CreateHubAction;
use App\Actions\Hub\DeleteHubAction;
use App\Actions\Hub\JoinHubAction;
use App\Actions\Hub\UpdateHubAction;
use App\Http\Requests\CreateHubRequest;
use App\Http\Requests\UpdateHubRequest;
use App\Http\Resources\HubMemberResource;
use App\Http\Resources\HubResource;
use App\Models\Hub;
use App\Services\HubService;
use App\Traits\ApiResponser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class HubController extends Controller
{
    use ApiResponser, AuthorizesRequests;

    /**
     * @param  HubService  $hubService
     * @param  CreateHubAction  $createHubAction
     * @param  UpdateHubAction  $updateHubAction
     * @param  DeleteHubAction  $deleteHubAction
     * @param  JoinHubAction  $joinHubAction
     */
    public function __construct(
        private HubService $hubService,
        private CreateHubAction $createHubAction,
        private UpdateHubAction $updateHubAction,
        private DeleteHubAction $deleteHubAction,
        private JoinHubAction $joinHubAction,
    ) {}

    /**
     * List all hubs with pagination.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Hub::class);

        $hubs = $this->hubService->paginate();

        return $this->success([
            'hubs' => HubResource::collection($hubs),
            'pagination' => [
                'total' => $hubs->total(),
                'per_page' => $hubs->perPage(),
                'current_page' => $hubs->currentPage(),
                'last_page' => $hubs->lastPage(),
            ],
        ], 200, 'Hubs fetched successfully');
    }

    /**
     * Create a new hub.
     *
     * @param  CreateHubRequest  $request
     * @return JsonResponse
     */
    public function store(CreateHubRequest $request): JsonResponse
    {
        $this->authorize('create', Hub::class);

        $hub = $this->createHubAction->handle(
            $request->validated(),
            Auth::id(),
            $request->file('avatar'),
        );

        return $this->success(new HubResource($hub), 201, 'Hub created successfully');
    }

    /**
     * Show a single hub.
     *
     * @param  Hub  $hub
     * @return JsonResponse
     */
    public function show(Hub $hub): JsonResponse
    {
        $this->authorize('view', $hub);

        return $this->success(new HubResource($hub), 200, 'Hub fetched successfully');
    }

    /**
     * Update an existing hub.
     *
     * @param  UpdateHubRequest  $request
     * @param  Hub  $hub
     * @return JsonResponse
     */
    public function update(UpdateHubRequest $request, Hub $hub): JsonResponse
    {
        $this->authorize('update', $hub);

        $hub = $this->updateHubAction->handle(
            $hub,
            $request->validated(),
            $request->file('avatar'),
        );

        return $this->success(new HubResource($hub), 200, 'Hub updated successfully');
    }

    /**
     * Delete a hub.
     *
     * @param  Hub  $hub
     * @return JsonResponse
     */
    public function destroy(Hub $hub): JsonResponse
    {
        $this->authorize('delete', $hub);

        $this->deleteHubAction->handle($hub);

        return $this->success(null, 200, 'Hub deleted successfully');
    }

    /**
     * Join a public hub.
     *
     * @param  Hub  $hub
     * @return JsonResponse
     */
    public function join(Hub $hub): JsonResponse
    {
        $this->authorize('join', $hub);

        $joined = $this->joinHubAction->handle($hub, Auth::user());

        if (! $joined) {
            return $this->error(null, 409, 'You are already a member of this hub');
        }

        return $this->success(new HubResource($hub), 200, 'Joined hub successfully');
    }

    /**
     * List a hub's members.
     *
     * @param  Hub  $hub
     * @return JsonResponse
     */
    public function members(Hub $hub): JsonResponse
    {
        $this->authorize('view', $hub);

        $members = $this->hubService->fetchMembers($hub);

        return $this->success(HubMemberResource::collection($members), 200, 'Members fetched successfully');
    }

    /**
     * Get user's hubs
     *
     * @return JsonResponse
     */
    public function myHubs(): JsonResponse
    {
        $this->authorize('viewAny', Hub::class);

        $hubs = $this->hubService->fetchMyHubs(Auth::user());

        return $this->success($hubs, 200, 'Hubs fetched successfully');
    }
}
