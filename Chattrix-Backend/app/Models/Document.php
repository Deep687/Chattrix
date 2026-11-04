<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'workspace_id',
        'uploader_id',
        'filename',
        'path',
        'mime_type',
        'status',
        'error',
        'chunk_count',
    ];

    /**
     * Mirrors the column default, so a just-created document reads Pending rather than null.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'pending',
    ];

    /**
     * Attribute casting definitions.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => DocumentStatus::class,
            'chunk_count' => 'integer',
        ];
    }

    /**
     * Get the workspace (tenant) this document belongs to.
     *
     * @return BelongsTo<Workspace, Document>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who uploaded the document; null once that account is deleted.
     *
     * @return BelongsTo<User, Document>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    /**
     * Get the searchable chunks cut from this document.
     *
     * @return HasMany<DocumentChunk, Document>
     */
    public function chunks(): HasMany
    {
        return $this->hasMany(DocumentChunk::class);
    }

    /**
     * Hide failed uploads from everyone except the uploader and the owner: they are the only ones who
     * can act on the error, and to other employees a broken file is just noise.
     *
     * @param  Builder<Document>  $query
     * @param  User  $user
     * @param  Workspace  $workspace
     * @return void
     */
    #[Scope]
    protected function visibleTo(Builder $query, User $user, Workspace $workspace): void
    {
        if ($workspace->owner_id === $user->id) {
            return;
        }

        $query->where(fn (Builder $query) => $query
            ->where('status', '!=', DocumentStatus::Failed)
            ->orWhere('uploader_id', $user->id));
    }
}
