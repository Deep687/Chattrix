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
        Schema::create('hub_member',function(Blueprint $table){
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('hub_id')->constrained('hubs');
            $table->string('role');
            $table->timestamp('joined_at')->useCurrent();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hub_member');
    }
};
