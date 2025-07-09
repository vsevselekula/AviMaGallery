import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Мокаем next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Мокаем supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe('RegisterForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('отображает форму регистрации', () => {
    render(<RegisterForm />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Подтвердите пароль')
    ).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
  });

  it('отображает состояние загрузки при отправке формы', async () => {
    render(<RegisterForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Зарегистрироваться');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' },
    });
    fireEvent.click(submitButton);

    expect(screen.getByText('Регистрация...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('вызывает signUp и перенаправляет при успешной регистрации', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<RegisterForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Зарегистрироваться');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/verify-email');
    });
  });

  it('отображает ошибку при несовпадении паролей', async () => {
    render(<RegisterForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Зарегистрироваться');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'different-password' },
    });
    fireEvent.click(submitButton);

    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
  });

  it('отображает ошибку при неудачной регистрации', async () => {
    const error = new Error('Email уже используется');
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ error });

    render(<RegisterForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const confirmPasswordInput =
      screen.getByPlaceholderText('Подтвердите пароль');
    const submitButton = screen.getByText('Зарегистрироваться');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'password123' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email уже используется')).toBeInTheDocument();
    });
  });

  it('валидирует обязательные поля', async () => {
    render(<RegisterForm />);
    const submitButton = screen.getByText('Зарегистрироваться');

    fireEvent.click(submitButton);

    expect(screen.getByPlaceholderText('Email')).toBeRequired();
    expect(screen.getByPlaceholderText('Пароль')).toBeRequired();
    expect(screen.getByPlaceholderText('Подтвердите пароль')).toBeRequired();
  });
});
