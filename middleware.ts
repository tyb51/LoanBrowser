import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/cases',
  '/profile',
];

// Paths that should redirect authenticated users to dashboard
const authPaths = [
  '/auth/signin',
  '/auth/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path is an auth path
  const isAuthPath = authPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic
  if (isProtectedPath && !token) {
    // Redirect to signin if trying to access protected path without authentication
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  if (isAuthPath && token) {
    // Redirect to dashboard if already authenticated and trying to access auth paths
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cases/:path*',
    '/profile/:path*',
    '/auth/:path*',
  ],
};
