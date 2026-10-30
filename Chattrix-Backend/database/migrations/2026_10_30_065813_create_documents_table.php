<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * One uploaded file. The row exists before its chunks do: `status` tracks the embed job,
     * and `error` holds the reason when it fails so the UI can show it.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('workspace_id')
                ->index()
                ->constrained()
                ->cascadeOnDelete();

            // Company documents outlive the employee who uploaded them.
            $table->foreignId('uploader_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('filename');
            $table->string('path');
            $table->string('mime_type');
            $table->string('status')->default('pending');
            $table->text('error')->nullable();
            $table->unsignedInteger('chunk_count')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
