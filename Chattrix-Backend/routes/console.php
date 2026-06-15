<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Prune expired Sanctum access tokens daily.
Schedule::command('sanctum:prune-expired')->daily();

// Prune our custom expired refresh tokens daily.
Schedule::command('tokens:prune-refresh')->daily();
