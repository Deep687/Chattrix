<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    //

    protected $table = 'refresh_token';

    protected $fillable = [
        'user_id',
        'token_hash',
        'expires_at',
        'revoked_at'
    ];
}
