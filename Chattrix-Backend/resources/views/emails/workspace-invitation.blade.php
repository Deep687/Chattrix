@php
    $workspaceName = $invitation->workspace?->name ?? 'a workspace';
    $expires = $invitation->expires_at;
@endphp
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Workspace invitation</title>
    <!--[if mso]>
    <style>
        body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
</head>
<body style="margin:0; padding:0; width:100%; background-color:#f5f2ea;">
    <div style="display:none; font-size:1px; color:#f5f2ea; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
        {{ $user->name }} invited you to join {{ $workspaceName }} on Chattrix.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f2ea" style="background-color:#f5f2ea;">
        <tr>
            <td align="center" style="padding:40px 16px; background-color:#f5f2ea;">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#fdfbf6" style="width:100%; max-width:600px; background-color:#fdfbf6; border:1px solid #e3ddcf; border-radius:7px;">
                    <tr>
                        <td style="padding:20px 40px 0 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr><td style="border-top:3px double #1c1a16; font-size:0; line-height:0;">&nbsp;</td></tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 40px 0 40px; font-family:Georgia,'Times New Roman',serif; font-size:24px; font-weight:600; color:#1c1a16; letter-spacing:-0.3px;">
                            Chattrix<span style="display:inline-block; margin-left:3px; padding:0 4px; border:1px solid #a9a4ee; border-radius:3px; font-family:'SFMono-Regular',Menlo,Consolas,monospace; font-size:10px; line-height:14px; font-weight:600; color:#4338ca; vertical-align:super;">1</span>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 40px 0 40px; font-family:'SFMono-Regular',Menlo,Consolas,monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#5b574c;">
                            Invitation
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:8px 40px 0 40px; font-family:Georgia,'Times New Roman',serif; font-size:26px; line-height:32px; font-weight:600; color:#1c1a16;">
                            You've been invited to {{ $workspaceName }}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 40px 0 40px; font-family:Georgia,'Times New Roman',serif; font-size:17px; line-height:26px; color:#1c1a16;">
                            Dear {{ $invitation->email }},
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:10px 40px 0 40px; font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif; font-size:16px; line-height:24px; color:#5b574c;">
                            <span style="color:#1c1a16; font-weight:600;">{{ $user->name }}</span> ({{ $user->email }}) has invited you to join
                            <span style="color:#1c1a16; font-weight:600;">{{ $workspaceName }}</span> on Chattrix, where you can ask questions
                            against your team's internal documents.
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:14px 40px 0 40px; font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:17px; line-height:26px; color:#1c1a16;">
                            &mdash; {{ $user->name }}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 40px 0 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#4f46e5" style="background-color:#4f46e5; border-radius:5px;">
                                        <a href="{{ $url }}"
                                           style="display:inline-block; padding:13px 26px; font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif; font-size:16px; font-weight:600; line-height:20px; color:#ffffff; text-decoration:none; border-radius:5px;">
                                            Accept invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    @if ($expires)
                        <tr>
                            <td style="padding:16px 40px 0 40px; font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; color:#5b574c;">
                                This invitation expires on {{ $expires->format('F j, Y \a\t g:i A') }}.
                            </td>
                        </tr>
                    @endif

                    <tr>
                        <td style="padding:28px 40px 0 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr><td height="1" bgcolor="#e3ddcf" style="background-color:#e3ddcf; font-size:0; line-height:0;">&nbsp;</td></tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 40px 32px 40px; font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; line-height:20px; color:#5b574c;">
                            If the button doesn't work, copy and paste this link into your browser:
                            <br>
                            <a href="{{ $url }}" style="color:#4338ca; text-decoration:underline; word-break:break-all;">{{ $url }}</a>
                        </td>
                    </tr>
                </table>

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">
                    <tr>
                        <td style="padding:20px 40px; text-align:center; font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:14px; line-height:20px; color:#5b574c;">
                            You received this email because {{ $user->email }} invited {{ $invitation->email }} to a Chattrix workspace.
                            If you weren't expecting this, you can safely ignore it.
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
