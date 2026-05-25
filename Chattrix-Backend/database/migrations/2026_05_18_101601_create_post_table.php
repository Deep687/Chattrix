<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('hub_id')->index()->constrained('hubs');
            $table->foreignId('author_id')->index()->constrained('users');

            $table->string('type');
            $table->string('title');
            $table->longText('content')->nullable();
            $table->string('media_url')->nullable();

            $table->integer('score')->default(0);
            $table->integer('comment_count')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
