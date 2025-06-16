import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Middleware - Current path:', req.nextUrl.pathname);
  console.log('Middleware - Session exists:', !!session);

  // Публичные маршруты, которые не требуют авторизации
  const publicPaths = ['/auth'];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенным маршрутам
  if (!session && !isPublicPath) {
    console.log('Middleware - No session, redirecting to login');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь аутентифицирован и пытается получить доступ к страницам аутентификации
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    console.log('Middleware - Session exists, redirecting to dashboard');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь аутентифицирован и пытается получить доступ к корневой странице
  if (session && req.nextUrl.pathname === '/') {
    console.log(
      'Middleware - Session exists, redirecting from root to dashboard'
    );
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
