<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Accepts only a same-origin path such as `/workspace/invitations/accept?token=…`.
 *
 * Guards the `next` values that end up inside verification emails: a protocol-relative
 * `//evil.test` or an absolute URL would turn our own mail into an open redirect.
 */
class RelativePath implements ValidationRule
{
    /**
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  Closure  $fail
     * @return void
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! str_starts_with($value, '/') || str_starts_with($value, '//')) {
            $fail('The :attribute must be a relative path.');
        }
    }
}
