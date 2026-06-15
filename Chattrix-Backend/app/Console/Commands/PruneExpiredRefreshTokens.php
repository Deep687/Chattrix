<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneExpiredRefreshTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:prune-refresh';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune expired refresh tokens from the database';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Pruning expired refresh tokens...');

        $count = DB::table('refresh_tokens')->where('expires_at', '<', now())->delete();

        $this->info("Successfully pruned {$count} expired refresh tokens.");
    }
}
