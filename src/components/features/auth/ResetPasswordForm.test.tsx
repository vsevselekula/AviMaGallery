import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from './ResetPasswordForm';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Мокаем next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Мокаем supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('ResetPasswordForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockReset();
  });

  it('renders reset password form', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByText('Восстановить пароль')).toBeInTheDocument();
  });

  it('handles successful password reset', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    render(<ResetPasswordForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByText('Восстановить пароль');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Инструкции по восстановлению пароля отправлены на ваш email'
        )
      ).toBeInTheDocument();
    });
  });

  it('handles password reset error', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: { message: 'Любая ошибка' },
    });

    render(<ResetPasswordForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByText('Восстановить пароль');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Произошла ошибка при отправке письма')
      ).toBeInTheDocument();
    });
  });

  it('navigates to login page when clicking back button', () => {
    render(<ResetPasswordForm />);
    const backButton = screen.getByText('Вернуться на страницу входа');
    fireEvent.click(backButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });
});
