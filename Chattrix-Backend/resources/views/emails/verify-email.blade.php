<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Verify your email</title>
    <!--[if mso]>
    <style>
        body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
</head>
<body style="margin:0; padding:0; width:100%; background-color:#f5f3f3;">
    <div style="display:none; font-size:1px; color:#f5f3f3; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
        Confirm your email address to finish setting up your Chattrix account.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f3f3" style="background-color:#f5f3f3;">
        <tr>
            <td align="center" style="padding:40px 16px; background-color:#f5f3f3;">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#1a1a1a" style="width:600px; max-width:600px; background-color:#1a1a1a; border-radius:12px; border:1px solid #2a2424;">

                    <tr>
                        <td style="padding:32px 40px 0 40px; font-family:Arial,Helvetica,sans-serif; font-size:18px; font-weight:bold; color:#f0eded; letter-spacing:-0.2px;">
                            Chat<span style="color:#dc2626;">trix</span>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 40px 0 40px; font-family:Arial,Helvetica,sans-serif; font-size:24px; line-height:32px; font-weight:bold; color:#f0eded;">
                            Verify your email address
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 40px 0 40px; font-family:Arial,Helvetica,sans-serif; font-size:16px; line-height:24px; color:#9a8e8e;">
                            Hi <span style="color:#f0eded; font-weight:bold;">{{ $name }}</span>, please confirm this is your
                            email address to finish setting up your Chattrix account.
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 40px 0 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#dc2626" style="background-color:#dc2626; border-radius:8px;">
                                        <a href="{{ $url }}"
                                           style="display:inline-block; padding:14px 28px; font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:bold; line-height:20px; color:#ffffff; text-decoration:none; border-radius:8px;">
                                            Verify email address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 40px 0 40px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:20px; color:#6b5f5f;">
                            This link expires in {{ config('auth.verification.expire', 60) }} minutes.
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 40px 0 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr><td height="1" bgcolor="#2a2424" style="background-color:#2a2424; font-size:0; line-height:0;">&nbsp;</td></tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 40px 32px 40px; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; color:#6b5f5f;">
                            If the button doesn't work, copy and paste this link into your browser:
                            <br>
                            <a href="{{ $url }}" style="color:#dc2626; text-decoration:underline; word-break:break-all;">{{ $url }}</a>
                        </td>
                    </tr>

                </table>

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">
                    <tr>
                        <td style="padding:20px 40px; text-align:center; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:18px; color:#6b5f5f;">
                            If you didn't create a Chattrix account, you can safely ignore this email.
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
