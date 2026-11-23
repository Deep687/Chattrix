<?php

namespace App\Enums;

/**
 * Who may retrieve a document. Copied onto its chunks so the vector query can filter on it.
 */
enum DocumentAudience: string
{
    case Everyone = 'everyone';
    case Owners = 'owners';
}
