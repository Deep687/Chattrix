<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateHubRequest;
use Illuminate\Http\JsonResponse;
use App\Models\Hub;
use Illuminate\Support\Facades\Auth;

class HubController extends Controller
{
    public function index(): JsonResponse
    {
        $hubs = Hub::all();

        return response()->json([
            'message' => 'Hubs fetched successfully',
            'data' => $hubs
        ]);
    }

    public function store(CreateHubRequest $request): JsonResponse
    {
        $user = Auth::user();
        $hub = Hub::create($request->validated());

        return response()->json([
            'message' => 'Hub created successfully',
            'data' => $hub,
            'user'=> $user
        ], 201);
    }
}
