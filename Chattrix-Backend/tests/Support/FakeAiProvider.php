<?php

namespace Tests\Support;

use App\Services\Ai\AiProviderException;
use App\Services\Ai\ChatProvider;
use App\Services\Ai\ChatUsage;
use App\Services\Ai\EmbeddingProvider;
use Generator;

/**
 * Stands in for Gemini so no test makes a network call. Vectors are deterministic: a text that
 * contains a key of `$topics` embeds onto that topic's axis, so tests control what is "nearest".
 */
class FakeAiProvider implements ChatProvider, EmbeddingProvider
{
    /** @var array<string, int> keyword => axis */
    public array $topics = [];

    /** @var list<string> */
    public array $reply = ['Annual leave is 20 days [1].'];

    public bool $failEmbedding = false;

    public ?int $failChatAfter = null;

    public int $chatCalls = 0;

    /** @var list<array{system: string, prompt: string}> */
    public array $prompts = [];

    /** @var list<list<string>> */
    public array $embedBatches = [];

    /** What follow-up rewriting returns; null echoes the latest message back unchanged. */
    public ?string $rewriteTo = null;

    public bool $failRewrite = false;

    /** @var list<string> Prompts sent to the follow-up rewriter. */
    public array $rewrites = [];

    /** @var list<string> Texts sent to embedQuery, i.e. what retrieval actually searched for. */
    public array $queries = [];

    public function embedDocuments(array $texts): array
    {
        $this->embedBatches[] = $texts;

        return array_map($this->vector(...), $texts);
    }

    public function embedQuery(string $text): array
    {
        $this->queries[] = $text;

        return $this->vector($text);
    }

    public function stream(string $system, string $prompt): Generator
    {
        if (str_contains($system, 'standalone question')) {
            return yield from $this->rewrite($prompt);
        }

        $this->chatCalls++;
        $this->prompts[] = ['system' => $system, 'prompt' => $prompt];

        foreach ($this->reply as $i => $part) {
            if ($this->failChatAfter === $i) {
                throw new AiProviderException('Fake provider timed out.');
            }

            yield $part;
        }

        return new ChatUsage(120, 15);
    }

    /**
     * @return Generator<int, string, mixed, ChatUsage>
     */
    private function rewrite(string $prompt): Generator
    {
        $this->rewrites[] = $prompt;

        if ($this->failRewrite) {
            throw new AiProviderException('Fake rewrite failed.');
        }

        yield $this->rewriteTo ?? trim(substr($prompt, strrpos($prompt, 'Latest message:') + 15));

        return new ChatUsage(20, 8);
    }

    /**
     * @return list<float>
     */
    private function vector(string $text): array
    {
        if ($this->failEmbedding) {
            throw new AiProviderException('Fake provider is down.');
        }

        $vector = array_fill(0, config('services.gemini.embed_dimensions'), 0.0);
        // A small shared component keeps every vector non-zero, which cosine distance requires.
        $vector[0] = 0.01;

        foreach ($this->topics as $keyword => $axis) {
            if (str_contains(strtolower($text), $keyword)) {
                $vector[$axis] = 1.0;
            }
        }

        return $vector;
    }
}
