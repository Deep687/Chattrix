<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Only company registrants may create workspaces; invited employees join, never found.
     * Existing owners are backfilled so nobody loses an ability they were already using.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_create_workspaces')->default(false)->after('password');
        });

        DB::table('users')
            ->whereIn('id', DB::table('workspaces')->select('owner_id'))
            ->update(['can_create_workspaces' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('can_create_workspaces');
        });
    }
};
