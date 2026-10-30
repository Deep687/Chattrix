<?php

namespace App\Services\Ai;

use Generator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Gemini over plain REST. The key travels in a header, not the query string, so it never lands
 * in proxy or access logs.
 */
class GeminiClient implements ChatProvider, EmbeddingProvider
{
    /**
     * @param  array{key: ?string, base_url: string, chat_model: string, embed_model: string, embed_dimensions: int}  $config
     */
    public function __construct(private array $config) {}

    /**
     * @param  list<string>  $texts
     * @return list<list<float>>
     */
    public function embedDocuments(array $texts): array
    {
        if ($texts === []) {
            return [];
        }

        $model = 'models/'.$this->config['embed_model'];

        $response = $this->send('batchEmbedContents', $this->config['embed_model'], [
            'requests' => array_map(fn (string $text) => [
                'model' => $model,
                'content' => ['parts' => [['text' => $text]]],
                'taskType' => 'RETRIEVAL_DOCUMENT',
                'outputDimensionality' => $this->config['embed_dimensions'],
            ], $texts),
        ]);

        $vectors = array_map(fn (array $embedding) => $embedding['values'] ?? [], $response['embeddings'] ?? []);

        if (count($vectors) !== count($texts)) {
            throw new AiProviderException('Gemini returned '.count($vectors).' embeddings for '.count($texts).' texts.');
        }

        return array_map($this->checkWidth(...), $vectors);
    }

    /**
     * @return list<float>
     */
    public function embedQuery(string $text): array
    {
        $response = $this->send('embedContent', $this->config['embed_model'], [
            'content' => ['parts' => [['text' => $text]]],
            'taskType' => 'RETRIEVAL_QUERY',
            'outputDimensionality' => $this->config['embed_dimensions'],
        ]);

        return $this->checkWidth($response['embedding']['values'] ?? []);
    }

    /**
     * Reads Gemini's SSE stream line by line, yielding each text part as it arrives.
     *
     * @return Generator<int, string, mixed, ChatUsage>
     */
    public function stream(string $system, string $prompt): Generator
    {
        try {
            $response = $this->request(timeout: 60)
                ->withOptions(['stream' => true])
                ->post($this->url('streamGenerateContent', $this->config['chat_model']).'?alt=sse', [
                    'systemInstruction' => ['parts' => [['text' => $system]]],
                    'contents' => [['role' => 'user', 'parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['temperature' => 0.1],
                ])
                ->throw();
        } catch (ConnectionException|RequestException $e) {
            throw new AiProviderException('Gemini stream failed: '.$e->getMessage(), previous: $e);
        }

        $body = $response->toPsrResponse()->getBody();
        $buffer = '';
        $usage = new ChatUsage;

        try {
            while (! $body->eof()) {
                $buffer .= $body->read(1024);

                while (($newline = strpos($buffer, "\n")) !== false) {
                    $line = trim(substr($buffer, 0, $newline));
                    $buffer = substr($buffer, $newline + 1);

                    if (! str_starts_with($line, 'data:')) {
                        continue;
                    }

                    $event = json_decode(trim(substr($line, 5)), true);

                    if (! is_array($event)) {
                        continue;
                    }

                    if (isset($event['usageMetadata'])) {
                        $usage = new ChatUsage(
                            $event['usageMetadata']['promptTokenCount'] ?? 0,
                            $event['usageMetadata']['candidatesTokenCount'] ?? 0,
                        );
                    }

                    foreach ($event['candidates'][0]['content']['parts'] ?? [] as $part) {
                        if (($part['text'] ?? '') !== '') {
                            yield $part['text'];
                        }
                    }
                }
            }
        } catch (Throwable $e) {
            throw new AiProviderException('Gemini stream broke mid-response: '.$e->getMessage(), previous: $e);
        }

        return $usage;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function send(string $method, string $model, array $payload): array
    {
        try {
            return $this->request(timeout: 30)
                // Rate limits and outages are worth retrying; a 400 means our request is wrong.
                ->retry(3, fn (int $attempt) => $attempt * 1000, function (Throwable $e) {
                    return $e instanceof ConnectionException
                        || ($e instanceof RequestException && ($e->response->status() === 429 || $e->response->serverError()));
                })
                ->post($this->url($method, $model), $payload)
                ->throw()
                ->json();
        } catch (ConnectionException|RequestException $e) {
            throw new AiProviderException("Gemini {$method} failed: ".$e->getMessage(), previous: $e);
        }
    }

    private function request(int $timeout): PendingRequest
    {
        if (blank($this->config['key'])) {
            throw new AiProviderException('GEMINI_API_KEY is not set.');
        }

        return Http::withHeaders(['x-goog-api-key' => $this->config['key']])
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout($timeout);
    }

    private function url(string $method, string $model): string
    {
        return rtrim($this->config['base_url'], '/')."/models/{$model}:{$method}";
    }

    /**
     * A wrong-width vector would only fail at insert time, deep in the job; fail here instead.
     *
     * @param  array<int, float>  $vector
     * @return list<float>
     */
    private function checkWidth(array $vector): array
    {
        if (count($vector) !== $this->config['embed_dimensions']) {
            throw new AiProviderException('Gemini returned a '.count($vector).'-wide vector; expected '.$this->config['embed_dimensions'].'.');
        }

        return array_values($vector);
    }
}
