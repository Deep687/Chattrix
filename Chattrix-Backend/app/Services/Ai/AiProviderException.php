<?php

namespace App\Services\Ai;

use RuntimeException;

/**
 * The model provider failed: timeout, quota, outage or a malformed reply. The message is for logs,
 * never for users — it can contain provider detail.
 */
class AiProviderException extends RuntimeException {}
