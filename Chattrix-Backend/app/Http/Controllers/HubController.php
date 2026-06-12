<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateHubRequest;
use App\Http\Requests\UpdateHubRequest;
use Illuminate\Http\JsonResponse;
use App\Models\Hub;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class HubController extends Controller
{
    use AuthorizesRequests;

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Hub::class);

        $hubs = Hub::paginate(15);

        return response()->json([
            'message' => 'Hubs fetched successfully',
            'data' => $hubs
        ]);
    }

    public function store(CreateHubRequest $request): JsonResponse
    {
        $this->authorize('create', Hub::class);

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $hub = Hub::create(array_merge($data, ['owner_id' => Auth::id()]));

        return response()->json([
            'message' => 'Hub created successfully',
            'data' => $hub,
        ], 201);
    }

    public function show(Hub $hub): JsonResponse
    {
        $this->authorize('view', $hub);

        return response()->json([
            'message' => 'Hub fetched successfully',
            'data' => $hub,
        ], 200);
    }

    public function update(UpdateHubRequest $request, Hub $hub): JsonResponse
    {
        $this->authorize('update', $hub);

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($hub->avatar) {
                Storage::disk('public')->delete($hub->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $hub->update($data);

        return response()->json([
            'message' => 'Hub updated successfully',
            'data' => $hub,
        ], 200);
    }

    public function destroy(Hub $hub): JsonResponse
    {
        $this->authorize('delete', $hub);

        $hub->delete();

        return response()->json([
            'message' => 'Hub deleted successfully',
        ], 200);
    }
}
