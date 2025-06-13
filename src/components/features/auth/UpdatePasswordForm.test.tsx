import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpdatePasswordForm } from './UpdatePasswordForm';
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
      updateUser: jest.fn(),
    },
  },
}));

describe('UpdatePasswordForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (supabase.auth.updateUser as jest.Mock).mockReset();
  });

  it('renders update password form', () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByPlaceholderText('Новый пароль')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Подтвердите пароль')
    ).toBeInTheDocument();
    expect(screen.getByText('Обновить пароль')).toBeInTheDocument();
  });

  it('validates password matching', async () => {
    render(<UpdatePasswordForm />);
    const passwordInput = screen.getByPlaceholderText('Новый пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Обновить пароль');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password456' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
    });
  });

  it('handles successful password update', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    render(<UpdatePasswordForm />);
    const passwordInput = screen.getByPlaceholderText('Новый пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Обновить пароль');

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/auth/login?message=password-updated'
      );
    });
  });

  it('handles password update error', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      error: { message: 'Любая ошибка' },
    });

    render(<UpdatePasswordForm />);
    const passwordInput = screen.getByPlaceholderText('Новый пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Обновить пароль');

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Произошла ошибка при обновлении пароля')
      ).toBeInTheDocument();
    });
  });
});
