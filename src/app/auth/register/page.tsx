import { Metadata } from 'next';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Регистрация | Avito Gallery',
  description: 'Создайте новый аккаунт в Avito Gallery',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Создание аккаунта
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Или{' '}
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              войдите в существующий аккаунт
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
