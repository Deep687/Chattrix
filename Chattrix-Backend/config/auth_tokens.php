<?php

return [
    /*
     * How long a single refresh token stays usable. Every rotation issues a new token with a
     * fresh window, so this behaves as an idle timeout: a session ends once it goes this long
     * without a refresh.
     */
    'refresh_token_expiration_in_minutes' => env(
        'REFRESH_TOKEN_EXPIRATION_IN_MINUTES',
        1
    ),

    /*
     * A hard ceiling measured from the original login, carried across every rotation via
     * `refresh_token.session_started_at`. Once a chain passes this age it can no longer be
     * rotated no matter how active it is, so the user must re-authenticate. Override with a
     * small value in .env when testing the cutoff.
     */
    'absolute_session_lifetime_in_minutes' => env(
        'ABSOLUTE_SESSION_LIFETIME_IN_MINUTES',
        60 * 24 * 30 // 30 days
    ),
];
