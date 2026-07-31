<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A pending intent to join a workspace, keyed by email rather than user id: the invitee may
     * have no account yet, so the address is the only identity available at invite time. The
     * membership fact lives in `workspace_user` and is written on acceptance.
     */
    public function up(): void
    {
        Schema::create('workspace_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->string('email');
            $table->string('token_hash')->unique();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });

        // One *pending* invitation per address per workspace. A plain unique on (workspace_id,
        // email) would also collide with accepted rows, so re-inviting somebody who had been
        // removed would fail. Partial index instead — `unique()` cannot express a WHERE clause.
        DB::statement(
            'CREATE UNIQUE INDEX workspace_invitations_pending_unique
             ON workspace_invitations (workspace_id, email)
             WHERE accepted_at IS NULL'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_invitations');
    }
};
