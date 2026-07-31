<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Rotation issues each refresh token with a full fresh TTL, so `expires_at` is an idle
     * timeout only and a chain could otherwise be extended indefinitely. `session_started_at`
     * is copied from a rotated token to its successor, giving the whole chain a fixed origin
     * that the absolute session lifetime is measured against.
     */
    public function up(): void
    {
        Schema::create('refresh_token', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->index();
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at')->index();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('session_started_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refresh_token');
    }
};
