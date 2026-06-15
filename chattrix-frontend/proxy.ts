import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const access_token = request.cookies.get('access_token');
  const refresh_token = request.cookies.get('refresh_token');

  if (access_token) {
    return NextResponse.next();
  }

  if (!refresh_token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Refresh-Token': refresh_token.value,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const redirect = NextResponse.redirect(new URL('/login', request.url));
      redirect.cookies.delete('access_token');
      redirect.cookies.delete('refresh_token');
      return redirect;
    }

    const data = await response.json();

    const newAccessToken: string | undefined = data?.data?.access_token;
    
    const newRefreshToken: string | undefined = data?.data?.refresh_token;

    if (!newAccessToken) {
      const redirect = NextResponse.redirect(new URL('/login', request.url));
      redirect.cookies.delete('access_token');
      redirect.cookies.delete('refresh_token');
      return redirect;
    }

    const next = NextResponse.next();

    next.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.data.access_expires_in,
    });

    if (newRefreshToken) {
      next.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: data.data.refresh_expires_in,
      });
    }

    return next;
  } catch {
    const redirect = NextResponse.redirect(new URL('/login', request.url));
    redirect.cookies.delete('access_token');
    redirect.cookies.delete('refresh_token');
    return redirect;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|signup|api).*)',
  ],
}