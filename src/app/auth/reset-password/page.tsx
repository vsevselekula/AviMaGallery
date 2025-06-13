import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Восстановление пароля | Avito Gallery',
  description: 'Восстановите доступ к вашему аккаунту Avito Gallery',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Восстановление пароля
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите ваш email, и мы отправим вам инструкции по восстановлению
            пароля
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
