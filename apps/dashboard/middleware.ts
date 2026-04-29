import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/overview', '/logs', '/keys', '/usage', '/settings'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_ROUTES.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get('better-auth.session_token') || 
                        req.cookies.get('__Secure-better-auth.session_token');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
