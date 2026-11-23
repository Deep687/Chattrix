<?php

namespace App\Enums;

enum WorkspaceRole: string
{
    case Owner = 'owner';
    case Member = 'member';

    /**
     * The document audiences this role may retrieve. The one place role maps to visibility.
     *
     * @return list<DocumentAudience>
     */
    public function visibleAudiences(): array
    {
        return match ($this) {
            self::Owner => [DocumentAudience::Everyone, DocumentAudience::Owners],
            self::Member => [DocumentAudience::Everyone],
        };
    }
}
