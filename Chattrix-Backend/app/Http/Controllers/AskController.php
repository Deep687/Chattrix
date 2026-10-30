<?php

namespace App\Http\Controllers;

use App\Http\Requests\AskQuestionRequest;
use App\Models\Conversation;
use App\Models\Workspace;
use App\Services\RagService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AskController extends Controller
{
    use AuthorizesRequests;

    /**
     * @param  RagService  $ragService
     */
    public function __construct(private RagService $ragService) {}

    /**
     * Answer a question as a server-sent event stream, continuing a thread or starting one.
     *
     * Authorisation, validation and the thread lookup all run before the stream opens, so they
     * still fail as ordinary 403/404/422 JSON. Errors after that arrive as an `error` event,
     * since the 200 is already sent.
     *
     * @param  AskQuestionRequest  $request
     * @param  Workspace  $workspace
     * @return StreamedResponse
     */
    public function __invoke(AskQuestionRequest $request, Workspace $workspace): StreamedResponse
    {
        $this->authorize('ask', $workspace);

        $question = trim($request->validated('question'));
        $conversation = $this->conversation($workspace, $request->validated('conversation_id'), $question);

        return response()->eventStream(
            fn () => $this->ragService->stream($conversation, $question),
            // Stops nginx buffering the whole answer before sending it.
            ['X-Accel-Buffering' => 'no'],
            endStreamWith: null,
        );
    }

    /**
     * The caller's own thread in this workspace, or a new one titled by its first question. A
     * thread id from another user or workspace is a 404, never a way into someone else's thread.
     *
     * @param  Workspace  $workspace
     * @param  int|null  $conversationId
     * @param  string  $question
     * @return Conversation
     */
    private function conversation(Workspace $workspace, ?int $conversationId, string $question): Conversation
    {
        if ($conversationId === null) {
            return $workspace->conversations()->create([
                'user_id' => Auth::id(),
                'title' => Str::limit($question, 80),
            ]);
        }

        return $workspace->conversations()
            ->whereKey($conversationId)
            ->where('user_id', Auth::id())
            ->firstOrFail();
    }
}
