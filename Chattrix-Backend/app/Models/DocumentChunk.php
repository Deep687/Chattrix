<?php

namespace App\Models;

use Database\Factories\DocumentChunkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentChunk extends Model
{
    /** @use HasFactory<DocumentChunkFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'document_id',
        'workspace_id',
        'chunk_index',
        'content',
        'embedding',
        'page',
        'token_count',
        'char_start',
        'char_end',
    ];

    /**
     * 768 floats per row would bloat every response that serialises a chunk.
     *
     * @var list<string>
     */
    protected $hidden = [
        'embedding',
    ];

    /**
     * Attribute casting definitions.
     *
     * pgvector's text form `[0.1,0.2]` is also valid JSON, so the `array` cast round-trips it.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'embedding' => 'array',
            'chunk_index' => 'integer',
            'page' => 'integer',
            'token_count' => 'integer',
            'char_start' => 'integer',
            'char_end' => 'integer',
        ];
    }

    /**
     * Get the document this chunk was cut from.
     *
     * @return BelongsTo<Document, DocumentChunk>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the workspace (tenant) this chunk belongs to; copied from the document for filtering.
     *
     * @return BelongsTo<Workspace, DocumentChunk>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
