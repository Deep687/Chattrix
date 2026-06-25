<?php

namespace App\Http\Controllers;

use App\Actions\Hub\CreateHubAction;
use App\Actions\Hub\DeleteHubAction;
use App\Actions\Hub\UpdateHubAction;
use App\Http\Requests\CreateHubRequest;
use App\Http\Requests\UpdateHubRequest;
use App\Http\Resources\HubResource;
use App\Models\Hub;
use App\Services\HubService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class HubController extends Controller
{
    use ApiResponser, AuthorizesRequests;

    /**
     * @param HubService $hubService
     * @param CreateHubAction $createHubAction
     * @param UpdateHubAction $updateHubAction
     * @param DeleteHubAction $deleteHubAction
     */
    public function __construct(
        private HubService $hubService,
        private CreateHubAction $createHubAction,
        private UpdateHubAction $updateHubAction,
        private DeleteHubAction $deleteHubAction,
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
            'hubs'       => HubResource::collection($hubs),
            'pagination' => [
                'total'        => $hubs->total(),
                'per_page'     => $hubs->perPage(),
                'current_page' => $hubs->currentPage(),
                'last_page'    => $hubs->lastPage(),
            ],
        ], 200, 'Hubs fetched successfully');
    }

    /**
     * Create a new hub.
     *
     * @param CreateHubRequest $request
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
     * @param Hub $hub
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
     * @param UpdateHubRequest $request
     * @param Hub $hub
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
     * @param Hub $hub
     * @return JsonResponse
     */
    public function destroy(Hub $hub): JsonResponse
    {
        $this->authorize('delete', $hub);

        $this->deleteHubAction->handle($hub);

        return $this->success(null, 200, 'Hub deleted successfully');
    }
}
