<?php

namespace App\Enums;

enum EmailVerificationOutcome
{
    case Invalid;
    case AlreadyVerified;
    case Verified;

    public function status(): int
    {
        return $this === self::Invalid ? 403 : 200;
    }

    public function message(): string
    {
        return match ($this) {
            self::Invalid => 'Invalid verification link',
            self::AlreadyVerified => 'Email already verified',
            self::Verified => 'Email verified successfully',
        };
    }
}
