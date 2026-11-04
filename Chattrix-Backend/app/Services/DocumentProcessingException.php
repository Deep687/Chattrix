<?php

namespace App\Services;

use RuntimeException;

/**
 * A document that can never be embedded, however often the job retries: encrypted, scanned,
 * empty, or too large. The message is shown to users, so it must stay free of internals.
 */
class DocumentProcessingException extends RuntimeException {}
