<?php

return [
    /*
     * How long an invitation link stays usable. Short because the token travels over email and
     * grants tenant access. Re-inviting restarts the window.
     */
    'expiration_in_hours' => env('INVITATION_EXPIRATION_IN_HOURS', 12),
];
