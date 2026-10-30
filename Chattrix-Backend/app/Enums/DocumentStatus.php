<?php

namespace App\Enums;

/**
 * Where a document is in the embed pipeline. Only `Ready` documents are searchable.
 */
enum DocumentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';
}
