@php
    $workspaceName = $invitation->workspace?->name ?? 'a workspace';
    $expires = $invitation->expires_at;
@endphp
CHATTRIX

You've been invited to {{ $workspaceName }}

Dear {{ $invitation->email }},

{{ $user->name }} ({{ $user->email }}) has invited you to join {{ $workspaceName }} on Chattrix, where you can ask questions against your team's internal documents.

— {{ $user->name }}

Accept invitation:
{{ $url }}
@if ($expires)

This invitation expires on {{ $expires->format('F j, Y \a\t g:i A') }}.
@endif

You received this email because {{ $user->email }} invited {{ $invitation->email }} to a Chattrix workspace. If you weren't expecting this, you can safely ignore it.
