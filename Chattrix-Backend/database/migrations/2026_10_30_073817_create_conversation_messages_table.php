<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Assistant rows keep a snapshot of the sources they cited, so an old answer still shows its
     * evidence after the document is re-indexed or deleted.
     */
    public function up(): void
    {
        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversation_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('role');
            $table->text('content');

            // What was actually searched for, when a follow-up was rewritten into a standalone question.
            $table->text('search_query')->nullable();

            $table->json('sources')->nullable();
            $table->json('cited')->nullable();
            $table->boolean('answered')->nullable();
            $table->json('usage')->nullable();

            $table->timestamps();

            $table->index(['conversation_id', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
    }
};
