'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          router.push('/');
        } catch (error) {
          console.error('Error exchanging code for session:', error);
          router.push('/auth/login?error=callback');
        }
      } else {
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Обработка входа...</h1>
        <p className="text-gray-600">
          Пожалуйста, подождите, пока мы завершаем процесс аутентификации.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Загрузка...</h1>
            <p className="text-gray-600">Пожалуйста, подождите.</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
