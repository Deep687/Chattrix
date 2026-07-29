<?php

namespace App\Models;

use App\Enums\WorkspaceRole;
use Database\Factories\WorkspaceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Workspace extends Model
{
    /** @use HasFactory<WorkspaceFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'avatar',
        'owner_id',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->withPivot(['role', 'joined_at']);
    }

    /**
     * Determine whether the user is inside this workspace.
     *
     * Membership is the whole access rule — there is no public or discoverable state — so
     * this is the check every workspace ability and every document query resolves to.
     */
    public function hasMember(User $user): bool
    {
        return $this->members()
            ->whereKey($user->getKey())
            ->exists();
    }

    /**
     * Determine whether the user holds the given tenant role in this workspace.
     */
    public function hasMemberWithRole(User $user, WorkspaceRole $role): bool
    {
        return $this->members()
            ->whereKey($user->getKey())
            ->wherePivot('role', $role->value)
            ->exists();
    }
}
