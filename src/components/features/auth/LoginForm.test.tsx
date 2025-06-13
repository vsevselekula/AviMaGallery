import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
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
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginForm', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('отображает форму входа', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  it('отображает состояние загрузки при отправке формы', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const submitButton = screen.getByText('Войти');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Вход...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('вызывает signInWithPassword и перенаправляет при успешном входе', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const submitButton = screen.getByText('Войти');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('отображает ошибку при неудачном входе', async () => {
    const error = new Error('Неверные учетные данные');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error,
    });

    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const submitButton = screen.getByText('Войти');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Неверные учетные данные')).toBeInTheDocument();
    });
  });

  it('валидирует обязательные поля', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByText('Войти');

    fireEvent.click(submitButton);

    expect(screen.getByPlaceholderText('Email')).toBeRequired();
    expect(screen.getByPlaceholderText('Пароль')).toBeRequired();
  });
});
