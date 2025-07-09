import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Подтверждение email | Avito Gallery',
  description: 'Подтвердите ваш email для завершения регистрации',
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Подтверждение email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Мы отправили вам письмо с подтверждением. Пожалуйста, проверьте вашу
            почту и перейдите по ссылке для завершения регистрации.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Вернуться на страницу входа
          </Link>
        </div>
      </div>
    </div>
  );
}
