<?php

namespace App\Models;

use Database\Factories\WorkspaceInvitationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkspaceInvitation extends Model
{
    /** @use HasFactory<WorkspaceInvitationFactory> */
    use HasFactory;

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

    /**
     * The workspace this invitation grants membership of.
     *
     * @return BelongsTo<Workspace, WorkspaceInvitation>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * The member who issued the invitation.
     *
     * @return BelongsTo<User, WorkspaceInvitation>
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Resolve an invitation from the plaintext token in the emailed link.
     *
     * Lookup is by hash so the database never holds a usable token, mirroring `refresh_token`.
     * Accepted and expired rows still resolve — the caller decides which failure to report,
     * since "already used" and "expired" need different wording in the UI.
     *
     * @param  string  $token  The plaintext token from the link.
     * @return WorkspaceInvitation|null
     */
    public static function findByToken(string $token): ?self
    {
        return static::where('token_hash', hash('sha256', $token))->first();
    }

    /**
     * @return bool True once the invitation has been redeemed.
     */
    public function isAccepted(): bool
    {
        return $this->accepted_at !== null;
    }

    /**
     * @return bool True once the link's window has closed.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Scope to invitations that are still redeemable.
     *
     * @param  Builder<WorkspaceInvitation>  $query
     * @return Builder<WorkspaceInvitation>
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereNull('accepted_at');
    }
}
