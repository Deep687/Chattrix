<?php

namespace Tests\Feature\Document;

use App\Enums\DocumentAudience;
use App\Jobs\EmbedDocumentJob;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Models\User;
use App\Models\Workspace;
use App\Services\Ai\EmbeddingProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeAiProvider;
use Tests\TestCase;

class DocumentAudienceTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $member;

    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->owner = User::factory()->create();
        $this->member = User::factory()->create();
        $this->workspace = Workspace::factory()->ownedBy($this->owner)->withMembers([$this->member])->create();
    }

    public function test_an_upload_defaults_to_everyone(): void
    {
        Queue::fake();

        $this->upload([])->assertCreated()->assertJsonPath('data.audience', DocumentAudience::Everyone->value);

        $this->assertSame(DocumentAudience::Everyone, Document::sole()->audience);
    }

    public function test_the_owner_can_upload_an_owner_only_document(): void
    {
        Queue::fake();

        $this->upload(['audience' => 'owners'])->assertCreated()->assertJsonPath('data.audience', 'owners');

        $this->assertSame(DocumentAudience::Owners, Document::sole()->audience);
    }

    public function test_an_unknown_audience_is_rejected(): void
    {
        Queue::fake();

        $this->upload(['audience' => 'admins'])->assertUnprocessable()->assertJsonValidationErrors('audience');

        $this->assertSame(0, Document::count());
    }

    public function test_a_member_cannot_list_or_open_owner_only_documents(): void
    {
        $open = Document::factory()->for($this->workspace)->ready()->create();
        $restricted = Document::factory()->for($this->workspace)->ready()->ownersOnly()->create();

        Sanctum::actingAs($this->member);
        $this->getJson(route('workspaces.documents.index', $this->workspace))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $open->id);
        $this->getJson(route('workspaces.documents.show', [$this->workspace, $restricted]))->assertNotFound();

        Sanctum::actingAs($this->owner);
        $this->getJson(route('workspaces.documents.index', $this->workspace))->assertOk()->assertJsonCount(2, 'data');
        $this->getJson(route('workspaces.documents.show', [$this->workspace, $restricted]))->assertOk();
    }

    public function test_changing_the_audience_restamps_every_chunk(): void
    {
        $document = Document::factory()->for($this->workspace)->ready()->create();
        DocumentChunk::factory()->for($document)->count(3)->sequence(fn ($sequence) => ['chunk_index' => $sequence->index])->create();

        Sanctum::actingAs($this->owner);
        $this->patchJson(route('workspaces.documents.update', [$this->workspace, $document]), ['audience' => 'owners'])
            ->assertOk()
            ->assertJsonPath('data.audience', 'owners');

        $this->assertSame(DocumentAudience::Owners, $document->fresh()->audience);
        $this->assertSame(['owners'], DocumentChunk::pluck('audience')->map->value->unique()->values()->all());
    }

    public function test_a_member_cannot_change_the_audience(): void
    {
        $document = Document::factory()->for($this->workspace)->ready()->ownersOnly()->create();

        Sanctum::actingAs($this->member);
        $this->patchJson(route('workspaces.documents.update', [$this->workspace, $document]), ['audience' => 'everyone'])
            ->assertForbidden();

        $this->assertSame(DocumentAudience::Owners, $document->fresh()->audience);
    }

    public function test_the_audience_is_required_when_changing_it(): void
    {
        $document = Document::factory()->for($this->workspace)->ready()->create();

        Sanctum::actingAs($this->owner);
        $this->patchJson(route('workspaces.documents.update', [$this->workspace, $document]), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('audience');
    }

    /**
     * The job holds the document as it was when queued; an audience change made while it was
     * embedding must still win, or the new chunks would be searchable by the wrong people.
     */
    public function test_the_embed_job_stamps_the_audience_current_at_write_time(): void
    {
        $this->app->instance(EmbeddingProvider::class, new FakeAiProvider);
        Storage::disk('local')->put('documents/pay.txt', 'Salary bands for engineers.');
        $document = Document::factory()->for($this->workspace)->create(['path' => 'documents/pay.txt', 'mime_type' => 'text/plain']);
        $job = new EmbedDocumentJob($document);

        Document::whereKey($document->id)->update(['audience' => DocumentAudience::Owners->value]);
        $this->app->call([$job, 'handle']);

        $this->assertSame(DocumentAudience::Owners, DocumentChunk::sole()->audience);
    }

    /**
     * @param  array<string, string>  $fields
     */
    private function upload(array $fields): TestResponse
    {
        Sanctum::actingAs($this->owner);

        return $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->createWithContent('policy.txt', 'Annual leave is 20 days.'),
            ...$fields,
        ], ['Accept' => 'application/json']);
    }
}
