<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Hub extends Model
{
    protected $fillable = [
        'description',
        'slug',
        'avatar',
        'privacy_type',
        'owner_id',
    ];
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'hub_member')
            ->withPivot('role')
            ->withTimestamps('joined_at');
    }
}
