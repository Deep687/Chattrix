<?php

namespace Tests\Feature\Document;

use App\Enums\DocumentStatus;
use App\Jobs\EmbedDocumentJob;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Support\MakesPdfs;
use Tests\TestCase;

class DocumentApiTest extends TestCase
{
    use MakesPdfs, RefreshDatabase;

    private User $owner;

    private User $member;

    private Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Queue::fake();

        $this->owner = User::factory()->create();
        $this->member = User::factory()->create();
        $this->workspace = Workspace::factory()->ownedBy($this->owner)->withMembers([$this->member])->create();
    }

    public function test_the_owner_can_upload_a_pdf_and_it_is_queued_for_embedding(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->createWithContent('Leave Policy.pdf', $this->pdf(['Annual leave is 20 days.'])),
        ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.filename', 'Leave Policy.pdf')
            ->assertJsonPath('data.status', DocumentStatus::Pending->value)
            ->assertJsonMissingPath('data.path');

        $document = Document::sole();
        $this->assertSame($this->workspace->id, $document->workspace_id);
        $this->assertSame('application/pdf', $document->mime_type);
        Storage::disk('local')->assertExists($document->path);
        Queue::assertPushed(EmbedDocumentJob::class, fn ($job) => $job->document->is($document));
    }

    public function test_text_and_markdown_are_accepted(): void
    {
        Sanctum::actingAs($this->owner);

        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->createWithContent('notes.txt', 'Plain text policy.'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->createWithContent('handbook.md', "# Handbook\n\nRules."),
        ], ['Accept' => 'application/json'])->assertCreated()->assertJsonPath('data.mime_type', 'text/markdown');
    }

    public function test_other_file_types_are_rejected(): void
    {
        Sanctum::actingAs($this->owner);

        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->create('payroll.xlsx', 10),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

        // Right extension, wrong content. A real file, because fakes report a type from the name.
        $path = tempnam(sys_get_temp_dir(), 'upload');
        imagepng(imagecreatetruecolor(10, 10), $path);

        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => new UploadedFile($path, 'fake.pdf', null, null, true),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('documents', 0);
    }

    public function test_oversized_files_are_rejected(): void
    {
        Sanctum::actingAs($this->owner);

        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->create('huge.pdf', 10241, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');
    }

    public function test_a_member_lists_only_their_workspaces_documents(): void
    {
        Document::factory()->for($this->workspace)->count(2)->create();
        Document::factory()->create();

        Sanctum::actingAs($this->member);

        $this->getJson(route('workspaces.documents.index', $this->workspace))
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_failed_documents_are_shown_only_to_their_uploader_and_the_owner(): void
    {
        $uploader = User::factory()->create();
        $this->workspace->members()->attach($uploader->id, ['role' => 'member', 'joined_at' => now()]);
        $failed = Document::factory()->for($this->workspace)->for($uploader, 'uploader')->failed()->create();
        Document::factory()->for($this->workspace)->ready()->create();

        Sanctum::actingAs($this->member);
        $this->getJson(route('workspaces.documents.index', $this->workspace))->assertJsonCount(1, 'data');
        $this->getJson(route('workspaces.documents.show', [$this->workspace, $failed]))->assertNotFound();

        Sanctum::actingAs($uploader);
        $this->getJson(route('workspaces.documents.index', $this->workspace))->assertJsonCount(2, 'data');

        Sanctum::actingAs($this->owner);
        $this->getJson(route('workspaces.documents.index', $this->workspace))
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['error' => 'The file could not be read.']);
    }

    public function test_deleting_a_document_removes_its_file_and_chunks(): void
    {
        Storage::disk('local')->put('documents/1/policy.pdf', 'x');
        $document = Document::factory()->for($this->workspace)->ready()->create(['path' => 'documents/1/policy.pdf']);
        DocumentChunk::factory()->for($document)->create();

        Sanctum::actingAs($this->owner);

        $this->deleteJson(route('workspaces.documents.destroy', [$this->workspace, $document]))->assertOk();

        $this->assertModelMissing($document);
        $this->assertDatabaseCount('document_chunks', 0);
        Storage::disk('local')->assertMissing('documents/1/policy.pdf');
    }

    public function test_a_member_can_read_but_not_upload_or_delete(): void
    {
        $document = Document::factory()->for($this->workspace)->ready()->create();

        Sanctum::actingAs($this->member);

        $this->getJson(route('workspaces.documents.index', $this->workspace))->assertOk();
        $this->getJson(route('workspaces.documents.show', [$this->workspace, $document]))->assertOk();
        $this->deleteJson(route('workspaces.documents.destroy', [$this->workspace, $document]))->assertForbidden();
        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->createWithContent('fake-policy.txt', 'Everyone gets 100 days of leave.'),
        ], ['Accept' => 'application/json'])->assertForbidden();

        $this->assertModelExists($document);
        $this->assertDatabaseCount('documents', 1);
    }

    public function test_a_non_member_is_refused_on_every_document_route(): void
    {
        $document = Document::factory()->for($this->workspace)->create();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson(route('workspaces.documents.index', $this->workspace))->assertForbidden();
        $this->getJson(route('workspaces.documents.show', [$this->workspace, $document]))->assertForbidden();
        $this->deleteJson(route('workspaces.documents.destroy', [$this->workspace, $document]))->assertForbidden();
        $this->post(route('workspaces.documents.store', $this->workspace), [
            'file' => UploadedFile::fake()->createWithContent('x.txt', 'x'),
        ], ['Accept' => 'application/json'])->assertForbidden();

        $this->assertModelExists($document);
    }

    public function test_another_tenants_document_cannot_be_reached_through_your_own_workspace(): void
    {
        $foreign = Document::factory()->create();

        Sanctum::actingAs($this->member);

        $this->getJson(route('workspaces.documents.show', [$this->workspace, $foreign]))->assertNotFound();
        $this->deleteJson(route('workspaces.documents.destroy', [$this->workspace, $foreign]))->assertNotFound();

        $this->assertModelExists($foreign);
    }
}
