import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const access_token = request.cookies.get('access_token');
  const refresh_token = request.cookies.get('refresh_token');

  console.log('access_token =>', access_token, 'refresh_token=>', refresh_token);

  if (!access_token && !refresh_token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|signup|api).*)',
  ],
}