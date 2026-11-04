<?php

namespace Tests\Feature\Isolation;

use App\Models\DocumentChunk;
use App\Models\User;
use App\Models\Workspace;
use App\Services\Ai\ChatProvider;
use App\Services\Ai\EmbeddingProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\FakeAiProvider;
use Tests\TestCase;

/**
 * M3: the `dont_know` rows of seed-data/golden-questions.csv, asked against the real demo
 * documents. The fact each one is after lives only in the other company's files, so it must
 * never reach the asker's prompt or sources. Whether the model then says "I don't know" is
 * scored by the M6 evals; this suite proves it has nothing else to say.
 */
class GoldenQuestionProbeTest extends TestCase
{
    use RefreshDatabase;

    private const string SEED_DIR = __DIR__.'/../../../../seed-data';

    private FakeAiProvider $ai;

    /** @var array<string, Workspace> */
    private array $workspaces = [];

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->ai = new FakeAiProvider;
        // Each probe lands on the axis of the other company's document that holds its fact.
        $this->ai->topics = ['vendor' => 1, 'password' => 2, 'hotline' => 3, 'leave' => 4, 'hotel' => 5, 'home' => 6];
        $this->app->instance(EmbeddingProvider::class, $this->ai);
        $this->app->instance(ChatProvider::class, $this->ai);

        foreach (['acme', 'globex'] as $tenant) {
            $owner = User::factory()->create();
            $this->workspaces[$tenant] = Workspace::factory()->ownedBy($owner)->create(['name' => ucfirst($tenant)]);

            foreach (glob(self::SEED_DIR."/{$tenant}/*") as $path) {
                $this->upload($owner, $this->workspaces[$tenant], $path);
            }
        }
    }

    #[DataProvider('crossTenantProbes')]
    public function test_a_golden_cross_tenant_question_never_sees_the_other_companys_fact(string $askedBy, string $question, string $fact): void
    {
        $asker = $this->workspaces[$askedBy];
        $this->assertProbeIsMeaningful($asker, $fact);

        Sanctum::actingAs($asker->owner);
        $this->postJson(route('workspaces.ask', $asker), ['question' => $question])->assertOk()->streamedContent();

        $prompt = $this->ai->prompts[0]['prompt'] ?? '';
        $this->assertStringNotContainsString($fact, $prompt);
        preg_match_all('/document="([^"]+)"/', $prompt, $sources);
        $this->assertNotEmpty($sources[1]);
        $this->assertSame([], array_filter($sources[1], fn (string $filename) => ! str_starts_with($filename, $askedBy)));
    }

    /**
     * @return array<string, array{string, string, string}>
     */
    public static function crossTenantProbes(): array
    {
        $rows = array_map(fn (string $line) => str_getcsv($line, escape: ''), file(self::SEED_DIR.'/golden-questions.csv', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        $header = array_shift($rows);
        $probes = [];

        foreach ($rows as $row) {
            $probe = array_combine($header, $row);

            if ($probe['expect'] === 'dont_know') {
                $probes["{$probe['asked_by']}: {$probe['question']}"] = [$probe['asked_by'], $probe['question'], $probe['fact']];
            }
        }

        return $probes;
    }

    /**
     * Guards the CSV: a fact that the asker's own documents also contain, or that the other
     * company's documents don't, would make the probe pass without proving anything.
     */
    private function assertProbeIsMeaningful(Workspace $asker, string $fact): void
    {
        $holders = DocumentChunk::where('content', 'like', '%'.$fact.'%')->pluck('workspace_id')->unique()->values()->all();

        $this->assertNotEmpty($holders, "No seed document contains \"{$fact}\".");
        $this->assertNotContains($asker->id, $holders, "The asker's own documents contain \"{$fact}\".");
    }

    private function upload(User $owner, Workspace $workspace, string $path): void
    {
        Sanctum::actingAs($owner);

        $this->post(route('workspaces.documents.store', $workspace), [
            'file' => UploadedFile::fake()->createWithContent(basename($path), file_get_contents($path)),
        ], ['Accept' => 'application/json'])->assertCreated();
    }
}
