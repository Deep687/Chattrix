<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Workspace;
use App\Traits\ApiResponser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * The caller's own chat threads. Scope-bound to the workspace, then limited to their author by
 * `ConversationPolicy`, so neither another tenant's nor a colleague's thread is reachable by id.
 */
class ConversationController extends Controller
{
    use ApiResponser, AuthorizesRequests;

    /**
     * List the caller's threads in this workspace, most recent first.
     *
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function index(Workspace $workspace): JsonResponse
    {
        $this->authorize('ask', $workspace);

        $conversations = $workspace->conversations()
            ->where('user_id', Auth::id())
            ->latest('updated_at')
            ->limit(100)
            ->get();

        return $this->success(ConversationResource::collection($conversations), 200, 'Conversations fetched successfully');
    }

    /**
     * Show one thread with its messages.
     *
     * @param  Workspace  $workspace
     * @param  Conversation  $conversation
     * @return JsonResponse
     */
    public function show(Workspace $workspace, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        return $this->success(new ConversationResource($conversation->load('messages')), 200, 'Conversation fetched successfully');
    }

    /**
     * Delete a thread and its messages.
     *
     * @param  Workspace  $workspace
     * @param  Conversation  $conversation
     * @return JsonResponse
     */
    public function destroy(Workspace $workspace, Conversation $conversation): JsonResponse
    {
        $this->authorize('delete', $conversation);

        $conversation->delete();

        return $this->success(null, 200, 'Conversation deleted successfully');
    }
}
