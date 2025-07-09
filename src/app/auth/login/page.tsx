import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Вход | Avito Gallery',
  description: 'Войдите в свой аккаунт Avito Gallery',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Вход в аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Или{' '}
            <a
              href="/auth/register"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              зарегистрируйтесь
            </a>
          </p>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <Suspense fallback={<LoadingSpinner />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
