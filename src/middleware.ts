import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  logger.auth.debug('Processing request', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
  });

  // Публичные маршруты, которые не требуют авторизации
  const publicPaths = ['/auth'];
  const isPublicPath = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенным маршрутам
  if (!session && !isPublicPath) {
    logger.auth.info('Redirecting unauthenticated user to login', {
      requestedPath: req.nextUrl.pathname,
    });
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь аутентифицирован и пытается получить доступ к страницам аутентификации
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    logger.auth.info(
      'Redirecting authenticated user from auth pages to dashboard'
    );
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь аутентифицирован и пытается получить доступ к корневой странице
  if (session && req.nextUrl.pathname === '/') {
    logger.auth.info('Redirecting authenticated user from root to dashboard');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
