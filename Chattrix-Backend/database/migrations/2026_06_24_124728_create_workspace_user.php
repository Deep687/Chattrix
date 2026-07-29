<?php

use App\Enums\WorkspaceRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This pivot is the single source of truth for tenant access: a row here means the user
     * is inside the workspace, and its absence means they are not. Every document, chunk and
     * retrieval query is gated on it.
     *
     * `role` carries the tenant-level role (see `App\Enums\WorkspaceRole`) and is separate
     * from the platform-level `users.role`. The workspace creator is stored as `owner` here
     * as well as in `workspaces.owner_id`, so authorisation never has to special-case the
     * owner with a second query.
     */
    public function up(): void
    {
        Schema::create('workspace_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();

            $table->string('role')->default(WorkspaceRole::Member->value);

            $table->primary(['user_id', 'workspace_id']);
            $table->timestamp('joined_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_user');
    }
};
