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

  // Если пользователь аутентифицирован
  if (session) {
    // Проверяем AAL для защищенных маршрутов
    if (!isPublicPath && !req.nextUrl.pathname.startsWith('/auth')) {
      try {
        const { data: aal } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        // Если AAL не достаточный (не AAL2), перенаправляем на логин для прохождения 2FA
        if (!aal || aal.currentLevel !== 'aal2') {
          logger.auth.info('User needs 2FA authentication', {
            currentAAL: aal?.currentLevel || 'none',
            requestedPath: req.nextUrl.pathname,
          });

          // НЕ выходим из сессии здесь - пусть Require2FA компонент обрабатывает это

          const redirectUrl = req.nextUrl.clone();
          redirectUrl.pathname = '/auth/login';
          redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
          redirectUrl.searchParams.set('require2fa', 'true');
          return NextResponse.redirect(redirectUrl);
        }

        logger.auth.debug('User has valid 2FA authentication', {
          currentAAL: aal.currentLevel,
        });
      } catch (error) {
        logger.auth.error('Error checking AAL level:', error);
        // При ошибке проверки AAL перенаправляем на логин
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Если пользователь пытается получить доступ к страницам аутентификации
    if (req.nextUrl.pathname.startsWith('/auth')) {
      logger.auth.info(
        'Redirecting authenticated user from auth pages to dashboard'
      );
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    // Если пользователь пытается получить доступ к корневой странице
    if (req.nextUrl.pathname === '/') {
      logger.auth.info('Redirecting authenticated user from root to dashboard');
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
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
