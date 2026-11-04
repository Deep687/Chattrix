<?php

namespace Tests\Feature\Ai;

use App\Services\Ai\AiProviderException;
use App\Services\Ai\GeminiClient;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeminiClientTest extends TestCase
{
    private GeminiClient $client;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();

        $this->client = new GeminiClient([
            'key' => 'test-key',
            'base_url' => 'https://gemini.test/v1beta',
            'chat_model' => 'gemini-test-flash',
            'embed_model' => 'gemini-embedding-001',
            'embed_dimensions' => 3,
        ]);
    }

    public function test_documents_are_embedded_in_one_batch_call_with_the_key_in_a_header(): void
    {
        Http::fake(['*' => Http::response(['embeddings' => [['values' => [0.1, 0.2, 0.3]], ['values' => [0.4, 0.5, 0.6]]]])]);

        $vectors = $this->client->embedDocuments(['first', 'second']);

        $this->assertSame([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]], $vectors);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://gemini.test/v1beta/models/gemini-embedding-001:batchEmbedContents'
                && $request->header('x-goog-api-key') === ['test-key']
                && $request['requests'][0]['taskType'] === 'RETRIEVAL_DOCUMENT'
                && $request['requests'][0]['outputDimensionality'] === 3;
        });
    }

    public function test_a_question_is_embedded_as_a_query(): void
    {
        Http::fake(['*' => Http::response(['embedding' => ['values' => [0.1, 0.2, 0.3]]])]);

        $this->client->embedQuery('How much leave?');

        Http::assertSent(fn (Request $request) => str_ends_with($request->url(), ':embedContent') && $request['taskType'] === 'RETRIEVAL_QUERY');
    }

    public function test_a_wrong_width_vector_is_rejected(): void
    {
        Http::fake(['*' => Http::response(['embedding' => ['values' => [0.1, 0.2]]])]);

        $this->expectException(AiProviderException::class);

        $this->client->embedQuery('How much leave?');
    }

    public function test_a_client_error_is_not_retried_and_becomes_a_provider_exception(): void
    {
        Http::fake(['*' => Http::response(['error' => ['message' => 'bad request']], 400)]);

        try {
            $this->client->embedQuery('How much leave?');
            $this->fail('Expected an AiProviderException.');
        } catch (AiProviderException) {
            Http::assertSentCount(1);
        }
    }

    public function test_a_rate_limit_is_retried(): void
    {
        Http::fakeSequence()
            ->push(['error' => 'quota'], 429)
            ->push(['embedding' => ['values' => [0.1, 0.2, 0.3]]]);

        $this->assertSame([0.1, 0.2, 0.3], $this->client->embedQuery('How much leave?'));
        Http::assertSentCount(2);
    }

    public function test_a_stream_yields_text_parts_and_returns_usage(): void
    {
        $sse = implode("\n\n", [
            'data: '.json_encode(['candidates' => [['content' => ['parts' => [['text' => 'Annual leave ']]]]]]),
            'data: '.json_encode(['candidates' => [['content' => ['parts' => [['text' => 'is 20 days [1].']]]]], 'usageMetadata' => ['promptTokenCount' => 42, 'candidatesTokenCount' => 7]]),
        ])."\n\n";

        Http::fake(['*' => Http::response($sse, 200, ['Content-Type' => 'text/event-stream'])]);

        $stream = $this->client->stream('system', 'prompt');
        $text = implode('', iterator_to_array($stream, false));

        $this->assertSame('Annual leave is 20 days [1].', $text);
        $this->assertSame(42, $stream->getReturn()->promptTokens);
        $this->assertSame(7, $stream->getReturn()->outputTokens);

        Http::assertSent(fn (Request $request) => str_ends_with($request->url(), ':streamGenerateContent?alt=sse')
            && $request['systemInstruction']['parts'][0]['text'] === 'system');
    }

    public function test_a_missing_key_fails_loudly(): void
    {
        $client = new GeminiClient([...config('services.gemini'), 'key' => null]);

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('GEMINI_API_KEY is not set.');

        $client->embedQuery('How much leave?');
    }
}
