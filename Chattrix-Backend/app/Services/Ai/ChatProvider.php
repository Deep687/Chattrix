<?php

namespace App\Services\Ai;

use Generator;

interface ChatProvider
{
    /**
     * Stream a completion as text deltas; the generator's return value carries token usage.
     *
     * @return Generator<int, string, mixed, ChatUsage>
     *
     * @throws AiProviderException
     */
    public function stream(string $system, string $prompt): Generator;
}
