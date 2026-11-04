<?php

namespace Tests\Feature\Isolation;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Document;
use App\Models\DocumentChunk;
use App\Models\User;
use App\Models\Workspace;
use App\Services\Ai\ChatProvider;
use App\Services\Ai\EmbeddingProvider;
use App\Services\RagService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Route as RouteDefinition;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\Support\FakeAiProvider;
use Tests\TestCase;

/**
 * M3: two tenants on one database, and nothing crosses between them — not through retrieval, not
 * through a guessed id, not after membership ends, not after the workspace is deleted.
 */
class CrossTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private FakeAiProvider $ai;

    private User $acmeMember;

    private Workspace $acme;

    private User $globexOwner;

    private Workspace $globex;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ai = new FakeAiProvider;
        $this->ai->topics = ['leave' => 1, 'salary' => 2];
        $this->app->instance(EmbeddingProvider::class, $this->ai);
        $this->app->instance(ChatProvider::class, $this->ai);

        $this->acmeMember = User::factory()->create();
        $this->acme = Workspace::factory()->withMembers([$this->acmeMember])->create(['name' => 'Acme']);

        $this->globexOwner = User::factory()->create();
        $this->globex = Workspace::factory()->ownedBy($this->globexOwner)->create(['name' => 'Globex']);
    }

    public function test_retrieval_returns_only_the_askers_workspace_even_when_another_tenant_is_nearer(): void
    {
        $this->chunks($this->globex, 'globex-pay.pdf', ['Salary leave bands: engineers earn 200k.']);
        $this->chunks($this->acme, 'acme-handbook.pdf', ['Annual leave is 20 days per year.']);

        $this->ask('What are the salary bands for leave?');

        $this->assertSame(['acme-handbook.pdf'], $this->sourceFilenames());
        $this->assertStringNotContainsString('200k', $this->ai->prompts[0]['prompt']);
        $this->assertSame(['acme-handbook.pdf'], array_column(ConversationMessage::where('role', 'assistant')->sole()->sources, 'filename'));
    }

    /**
     * Filtered ANN is where isolation and recall collide: the index finds Globex's chunks first
     * and the tenant filter throws them all away. Without `hnsw.iterative_scan` this returns zero
     * rows; with it the index keeps walking until it finds Acme's.
     */
    public function test_a_small_tenant_gets_its_own_results_through_the_vector_index_on_a_busy_table(): void
    {
        // Realistic geometry: Globex tight around the question, Acme loosely related. The fake's
        // one-hot vectors would put Acme orthogonal to everything, unreachable in the graph at all.
        mt_srand(42);
        $question = $this->ai->embedQuery('salary');
        $this->chunks($this->globex, 'globex-pay.pdf', array_fill(0, 300, 'Salary bands for engineers.'), $this->scattered(300, $question, 1.0, 0.3));
        $this->chunks($this->acme, 'acme-handbook.pdf', ['Annual leave is 20 days.', 'Leave carries over.', 'Sick leave is 10 days.'], $this->scattered(3, $question, 0.3, 1.0));

        // Both rolled back with the test's transaction. On a small table the planner prefers the
        // workspace_id btree or a seq scan; production-sized tables take the HNSW path, so force it.
        DB::statement('DROP INDEX document_chunks_workspace_id_index');
        DB::statement('SET LOCAL enable_seqscan = off');
        $this->assertStringContainsString('document_chunks_embedding_vectorindex', $this->explainRetrieval());

        $this->ask('What are the salary bands?');

        $this->assertSame(array_fill(0, 3, 'acme-handbook.pdf'), $this->sourceFilenames());
    }

    public function test_every_route_under_another_tenants_workspace_refuses_an_outsider(): void
    {
        $this->assertRefusedEverywhere($this->acmeMember, $this->globex, $this->globexRecords());
    }

    public function test_another_tenants_ids_are_not_found_through_your_own_workspace(): void
    {
        $records = $this->globexRecords();
        $nested = $this->workspaceRoutes()->filter(fn (RouteDefinition $route) => count($route->parameterNames()) > 1);

        Sanctum::actingAs($this->acmeMember);

        $this->assertNotEmpty($nested);

        foreach ($nested as $route) {
            $this->request($route, $this->acme, $records)->assertNotFound();
        }

        $this->assertGlobexUntouched($records);
    }

    public function test_a_removed_member_loses_access_immediately(): void
    {
        $leaver = User::factory()->create();
        $this->globex->members()->attach($leaver->id, ['role' => 'member']);
        $records = $this->globexRecords();
        $records['conversation'] = Conversation::factory()->for($this->globex)->for($leaver)->create();

        $this->globex->members()->detach($leaver->id);

        $this->assertRefusedEverywhere($leaver, $this->globex, $records);
    }

    public function test_acme_cannot_retrieve_globex_chunks(): void
    {
        $this->assertRetrievesOnlyItsOwn($this->acme, $this->globex);
    }

    public function test_globex_cannot_retrieve_acme_chunks(): void
    {
        $this->assertRetrievesOnlyItsOwn($this->globex, $this->acme);
    }

    public function test_a_cross_tenant_question_gets_i_dont_know_when_the_asker_has_nothing_relevant(): void
    {
        $this->chunks($this->globex, 'globex-pay.pdf', ['Salary bands: engineers earn 200k.']);

        $this->ask('What are the salary bands?');

        $message = ConversationMessage::where('role', 'assistant')->sole();
        $this->assertSame(RagService::DONT_KNOW, $message->content);
        $this->assertFalse($message->answered);
        $this->assertSame(0, $this->ai->chatCalls);
    }

    public function test_deleting_a_workspace_leaves_nothing_of_it_behind(): void
    {
        Storage::fake('local');
        $acmeOwner = $this->acme->owner;

        $this->upload($acmeOwner, $this->acme, 'leave.txt', 'Annual leave is 20 days.');
        $this->upload($this->globexOwner, $this->globex, 'pay.txt', 'Salary bands for engineers.');
        $this->chunks($this->globex, 'pay.txt', ['Salary bands for engineers.']);
        Conversation::factory()->for($this->globex)->for($this->globexOwner)->create();

        Sanctum::actingAs($this->globexOwner);
        $this->deleteJson(route('workspaces.destroy', $this->globex))->assertOk();

        $this->assertSame(0, DocumentChunk::where('workspace_id', $this->globex->id)->count());
        $this->assertSame(0, Document::where('workspace_id', $this->globex->id)->count());
        $this->assertSame(0, Conversation::where('workspace_id', $this->globex->id)->count());
        Storage::disk('local')->assertDirectoryEmpty("documents/{$this->globex->id}");

        // Deleting one tenant must not reach into another's files.
        Storage::disk('local')->assertExists(Document::where('workspace_id', $this->acme->id)->sole()->path);
    }

    /**
     * Calls retrieval directly, with no controller or policy in front of it: the `workspace_id`
     * filter alone has to keep the other tenant out, even when its chunks are the nearest.
     */
    private function assertRetrievesOnlyItsOwn(Workspace $asker, Workspace $other): void
    {
        $this->chunks($other, 'other.pdf', ['Salary bands: engineers earn 200k.']);
        $this->chunks($asker, 'own.pdf', ['Annual leave is 20 days.']);

        $chunks = app(RagService::class)->retrieve($asker, $this->ai->embedQuery('salary'));

        $this->assertNotEmpty($chunks);
        $this->assertSame([$asker->id], $chunks->pluck('workspace_id')->unique()->values()->all());
    }

    private function upload(User $owner, Workspace $workspace, string $filename, string $content): void
    {
        Sanctum::actingAs($owner);

        $this->post(route('workspaces.documents.store', $workspace), [
            'file' => UploadedFile::fake()->createWithContent($filename, $content),
        ], ['Accept' => 'application/json'])->assertCreated();
    }

    /**
     * @param  array{document: Document, conversation: Conversation}  $records
     */
    private function assertRefusedEverywhere(User $user, Workspace $workspace, array $records): void
    {
        $routes = $this->workspaceRoutes();

        Sanctum::actingAs($user);

        // Guards against the route filter silently matching nothing.
        $this->assertGreaterThanOrEqual(12, $routes->count());

        foreach ($routes as $route) {
            $status = $this->request($route, $workspace, $records)->status();

            $this->assertContains($status, [403, 404], "{$route->methods()[0]} {$route->uri()} answered {$status}.");
        }

        $this->assertSame(0, $this->ai->chatCalls);
        $this->assertSame([], $this->ai->queries);
        $this->assertGlobexUntouched($records);
    }

    /**
     * @param  array{document: Document, conversation: Conversation}  $records
     */
    private function assertGlobexUntouched(array $records): void
    {
        $this->assertModelExists($this->globex);
        $this->assertModelExists($records['document']);
        $this->assertModelExists($records['conversation']);
    }

    /**
     * Every API route bound to a workspace, discovered rather than listed, so a route added later
     * without authorisation fails this suite instead of slipping past it.
     *
     * @return Collection<int, RouteDefinition>
     */
    private function workspaceRoutes()
    {
        return collect(Route::getRoutes()->getRoutes())
            ->filter(fn (RouteDefinition $route) => str_starts_with($route->uri(), 'api/workspaces/{workspace}'))
            ->values();
    }

    /**
     * Sends a body valid enough to pass validation, so a refusal can only come from authorisation.
     *
     * @param  array{document: Document, conversation: Conversation}  $records
     */
    private function request(RouteDefinition $route, Workspace $workspace, array $records): TestResponse
    {
        $uri = '/'.strtr($route->uri(), [
            '{workspace}' => $workspace->id,
            '{document}' => $records['document']->id,
            '{conversation}' => $records['conversation']->id,
        ]);

        return $this->json($route->methods()[0], $uri, [
            'name' => 'Renamed',
            'email' => 'someone@example.com',
            'question' => 'What are the salary bands?',
            'file' => UploadedFile::fake()->createWithContent('x.txt', 'x'),
        ]);
    }

    /**
     * @return array{document: Document, conversation: Conversation}
     */
    private function globexRecords(): array
    {
        return [
            'document' => $this->chunks($this->globex, 'globex-pay.pdf', ['Salary bands for engineers.']),
            'conversation' => Conversation::factory()->for($this->globex)->for($this->globexOwner)->create(),
        ];
    }

    private function ask(string $question): void
    {
        Sanctum::actingAs($this->acmeMember);

        $this->postJson(route('workspaces.ask', $this->acme), ['question' => $question])->assertOk()->streamedContent();
    }

    /**
     * @return list<string>
     */
    private function sourceFilenames(): array
    {
        // No prompt means retrieval found nothing and the model was never called.
        $prompt = $this->ai->prompts === [] ? '' : end($this->ai->prompts)['prompt'];
        preg_match_all('/document="([^"]+)"/', $prompt, $matches);

        return $matches[1];
    }

    /**
     * `$count` vectors of `$near * $centre + $spread * noise`, with unit-length random noise.
     *
     * @param  list<float>  $centre
     * @return list<list<float>>
     */
    private function scattered(int $count, array $centre, float $near, float $spread): array
    {
        return array_map(function () use ($centre, $near, $spread) {
            $noise = array_map(fn () => mt_rand(-1000, 1000) / 1000, $centre);
            $length = sqrt(array_sum(array_map(fn (float $x) => $x * $x, $noise)));

            return array_map(fn (float $c, float $n) => $near * $c + $spread * $n / $length, $centre, $noise);
        }, range(1, $count));
    }

    private function explainRetrieval(): string
    {
        $vector = '['.implode(',', $this->ai->embedQuery('salary')).']';

        $plan = DB::select(
            'EXPLAIN SELECT id FROM document_chunks WHERE workspace_id = ? ORDER BY embedding <=> ?::vector LIMIT 6',
            [$this->acme->id, $vector],
        );

        return collect($plan)->pluck('QUERY PLAN')->implode("\n");
    }

    /**
     * Embeddings are passed in rather than updated afterwards: every update leaves a dead entry in
     * the HNSW graph, and enough of them make the vector-index test flaky.
     *
     * @param  list<string>  $contents
     * @param  list<list<float>>|null  $embeddings
     */
    private function chunks(Workspace $workspace, string $filename, array $contents, ?array $embeddings = null): Document
    {
        $document = Document::factory()->for($workspace)->ready()->create(['filename' => $filename]);

        foreach ($contents as $index => $content) {
            DocumentChunk::factory()->for($document)->create([
                'chunk_index' => $index,
                'content' => $content,
                'embedding' => $embeddings[$index] ?? $this->ai->embedQuery($content),
            ]);
        }

        $this->ai->queries = [];

        return $document;
    }
}
