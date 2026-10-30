<?php

namespace App\Http\Controllers;

use App\Actions\Document\DeleteDocumentAction;
use App\Actions\Document\UploadDocumentAction;
use App\Http\Requests\UploadDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\Workspace;
use App\Traits\ApiResponser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Routes are scope-bound, so `{document}` only resolves inside its own `{workspace}`: passing the
 * workspace policy can never reach another tenant's document by id.
 */
class DocumentController extends Controller
{
    use ApiResponser, AuthorizesRequests;

    /**
     * @param  UploadDocumentAction  $uploadDocumentAction
     * @param  DeleteDocumentAction  $deleteDocumentAction
     */
    public function __construct(
        private UploadDocumentAction $uploadDocumentAction,
        private DeleteDocumentAction $deleteDocumentAction,
    ) {}

    /**
     * List the workspace's documents, newest first.
     *
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function index(Workspace $workspace): JsonResponse
    {
        $this->authorize('viewDocuments', $workspace);

        $documents = $workspace->documents()
            ->visibleTo(Auth::user(), $workspace)
            ->with('uploader:id,name')
            ->latest()
            ->get();

        return $this->success(DocumentResource::collection($documents), 200, 'Documents fetched successfully');
    }

    /**
     * Upload a document; it is embedded in the background and starts as `pending`.
     *
     * @param  UploadDocumentRequest  $request
     * @param  Workspace  $workspace
     * @return JsonResponse
     */
    public function store(UploadDocumentRequest $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('uploadDocument', $workspace);

        $document = $this->uploadDocumentAction->handle($workspace, Auth::user(), $request->file('file'));

        return $this->success(new DocumentResource($document->load('uploader:id,name')), 201, 'Document uploaded successfully');
    }

    /**
     * Show one document; the client polls this while it is pending or processing.
     *
     * @param  Workspace  $workspace
     * @param  Document  $document
     * @return JsonResponse
     */
    public function show(Workspace $workspace, Document $document): JsonResponse
    {
        $this->authorize('viewDocuments', $workspace);

        abort_unless($workspace->documents()->visibleTo(Auth::user(), $workspace)->whereKey($document->id)->exists(), 404);

        return $this->success(new DocumentResource($document->load('uploader:id,name')), 200, 'Document fetched successfully');
    }

    /**
     * Delete a document, its chunks and its file.
     *
     * @param  Workspace  $workspace
     * @param  Document  $document
     * @return JsonResponse
     */
    public function destroy(Workspace $workspace, Document $document): JsonResponse
    {
        $this->authorize('deleteDocument', $workspace);

        $this->deleteDocumentAction->handle($document);

        return $this->success(null, 200, 'Document deleted successfully');
    }
}
