<?php

namespace App\Services\Ai;

/**
 * Turns text into vectors. Documents and questions are embedded separately because retrieval
 * models encode them differently; mixing the two lowers match quality.
 */
interface EmbeddingProvider
{
    /**
     * @param  list<string>  $texts
     * @return list<list<float>> One vector per text, in input order.
     *
     * @throws AiProviderException
     */
    public function embedDocuments(array $texts): array;

    /**
     * @return list<float>
     *
     * @throws AiProviderException
     */
    public function embedQuery(string $text): array;
}
