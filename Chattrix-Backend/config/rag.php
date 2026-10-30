<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Chunking
    |--------------------------------------------------------------------------
    |
    | Sizes are in bytes, at roughly 4 bytes per token for English: 2000 ≈ 500 tokens, and a 300
    | overlap ≈ 15%. Changing them only affects documents embedded afterwards.
    |
    */

    'chunk_size' => (int) env('RAG_CHUNK_SIZE', 2000),

    'chunk_overlap' => (int) env('RAG_CHUNK_OVERLAP', 300),

    // A cost ceiling: past this a document fails rather than spending the embedding quota.
    'max_chunks_per_document' => (int) env('RAG_MAX_CHUNKS_PER_DOCUMENT', 1500),

    // Gemini's batchEmbedContents accepts at most 100 texts per call.
    'embed_batch_size' => 100,

    /*
    |--------------------------------------------------------------------------
    | Retrieval
    |--------------------------------------------------------------------------
    */

    'top_k' => (int) env('RAG_TOP_K', 6),

    'max_question_length' => 1000,

];
