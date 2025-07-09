import { Metadata } from 'next';
import { UpdatePasswordForm } from '@/components/features/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Обновление пароля | Avito Gallery',
  description: 'Обновите пароль вашего аккаунта Avito Gallery',
};

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Обновление пароля
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите новый пароль для вашего аккаунта
          </p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
