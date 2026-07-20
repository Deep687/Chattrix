<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicUserResource;
use App\Models\User;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponser;

    /**
     * Show a user's public profile.
     *
     * @param  User  $user
     * @return JsonResponse
     */
    public function show(User $user): JsonResponse
    {
        return $this->success(new PublicUserResource($user), 200, 'User fetched successfully');
    }
}
