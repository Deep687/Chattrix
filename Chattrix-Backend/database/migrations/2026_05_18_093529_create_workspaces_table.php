<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * A workspace represents one tenant company and is always private: access is granted
     * solely by the presence of a `workspace_user` row. There is deliberately no privacy
     * or visibility column — a publicly readable workspace would be one where tenant
     * isolation is switched off, and isolation is the property this application exists
     * to guarantee. Membership is obtained by invitation, never by discovery.
     */
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();

            $table->foreignId('owner_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspaces');
    }
};
