<?php
namespace App\Http\Controllers;

use App\Http\Requests\CreateHubRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HubController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request);
    }

    public function createHub(CreateHubRequest $request): JsonResponse
    {

        return response()->json($request);
    }
}
