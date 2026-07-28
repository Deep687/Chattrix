<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    protected $table = 'refresh_token';

    protected $fillable = [
        'user_id',
        'token_hash',
        'expires_at',
        'revoked_at',
        'session_started_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'session_started_at' => 'datetime',

    ];

    /**
     * The user this refresh token belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine whether this token's rotation chain has outlived the absolute session
     * lifetime, measured from the original login rather than from the last refresh.
     */
    public function hasReachedAbsoluteLifetime(): bool
    {
        $lifetimeInMinutes = (int) config('auth_tokens.absolute_session_lifetime_in_minutes');

        return $this->session_started_at->addMinutes($lifetimeInMinutes)->isPast();
    }
}
