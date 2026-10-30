<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Lowercases `email` before validation, so every stored and compared address shares one form.
 * Postgres compares case-sensitively; mixed case would strand invites and split accounts.
 */
trait NormalizesEmail
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower(trim($this->input('email')))]);
        }
    }
}
