<?php

use App\Enums\DocumentAudience;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Existing rows default to `everyone`, so nothing already searchable disappears. No index on
     * chunk `audience`: two values add nothing over `workspace_id`, and would tempt the planner off HNSW.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('audience')->default(DocumentAudience::Everyone->value)->after('mime_type');
        });

        Schema::table('document_chunks', function (Blueprint $table) {
            $table->string('audience')->default(DocumentAudience::Everyone->value)->after('workspace_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_chunks', function (Blueprint $table) {
            $table->dropColumn('audience');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('audience');
        });
    }
};
