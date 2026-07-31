<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkspaceInvitation extends Model
{
    /**
     * The plaintext invite token, set only when the invitation is issued.
     *
     * Declared, not dynamic — an undeclared name would land in `$attributes` and be persisted.
     */
    public ?string $plainTextToken = null;

    protected $fillable = [
        'workspace_id',
        'email',
        'token_hash',
        'invited_by',
        'accepted_by',
        'expires_at',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }
}
