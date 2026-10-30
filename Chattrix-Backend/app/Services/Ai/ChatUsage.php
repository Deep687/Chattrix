<?php

namespace App\Services\Ai;

final readonly class ChatUsage
{
    public function __construct(
        public int $promptTokens = 0,
        public int $outputTokens = 0,
    ) {}
}
