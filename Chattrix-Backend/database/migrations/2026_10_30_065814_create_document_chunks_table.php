<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * One searchable slice of a document. `workspace_id` is copied from the document so the
     * tenant filter runs on this table alone, with no join in the retrieval query.
     */
    public function up(): void
    {
        Schema::ensureVectorExtensionExists();

        Schema::create('document_chunks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('document_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('workspace_id')
                ->index()
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger('chunk_index');
            $table->longText('content');

            // Hardcoded, not read from config: a schema must not change when .env does.
            // Must equal services.gemini.embed_dimensions; changing models means a new migration.
            $table->vector('embedding', 768);

            $table->unsignedInteger('page')->nullable();
            $table->unsignedInteger('token_count');
            $table->unsignedInteger('char_start');
            $table->unsignedInteger('char_end');

            $table->timestamps();

            // A retried job cannot insert the same chunk twice.
            $table->unique(['document_id', 'chunk_index']);
            $table->vectorIndex('embedding');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_chunks');
    }
};
