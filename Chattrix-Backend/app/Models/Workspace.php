<?php

namespace App\Models;

use App\Enums\WorkspaceRole;
use Database\Factories\WorkspaceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    /** @use HasFactory<WorkspaceFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'avatar',
        'owner_id',
    ];

    /**
     * Get the owner of the workspace.
     *
     * @return BelongsTo<User, Workspace>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all members belonging to the workspace.
     *
     * The pivot table stores each member's role and the date they joined.
     *
     * @return BelongsToMany<User, Workspace>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->withPivot(['role', 'joined_at']);
    }

    /**
     * Get all invitations ever issued for this workspace, accepted or not.
     *
     * @return HasMany<WorkspaceInvitation, Workspace>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(WorkspaceInvitation::class);
    }

    /**
     * Determine whether the given user belongs to this workspace.
     *
     * Membership is the primary access control mechanism for workspaces.
     *
     * @param  User  $user  The user to check for membership.
     * @return bool True if the user is a member of the workspace; otherwise, false.
     */
    public function hasMember(User $user): bool
    {
        return $this->members()
            ->whereKey($user->getKey())
            ->exists();
    }

    /**
     * Determine whether the given user belongs to this workspace
     * with the specified role.
     *
     * @param  User  $user  The user whose membership is being checked.
     * @param  WorkspaceRole  $role  The required workspace role.
     * @return bool True if the user has the specified role; otherwise, false.
     */
    public function hasMemberWithRole(User $user, WorkspaceRole $role): bool
    {
        return $this->members()
            ->whereKey($user->getKey())
            ->wherePivot('role', $role->value)
            ->exists();
    }
}
