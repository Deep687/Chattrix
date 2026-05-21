<?php

namespace App\Enums;

enum HubRole: string
{
    case Owner = 'owner';
    case Member = 'member';
}
