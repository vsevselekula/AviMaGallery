import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from './LogoutButton';
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
      signOut: jest.fn(),
    },
  },
}));

describe('LogoutButton', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('отображает кнопку выхода', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Выйти')).toBeInTheDocument();
  });

  it('отображает состояние загрузки при нажатии', async () => {
    render(<LogoutButton />);
    const button = screen.getByText('Выйти');

    fireEvent.click(button);

    expect(screen.getByText('Выход...')).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('вызывает signOut и перенаправляет на страницу входа при успешном выходе', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    render(<LogoutButton />);
    const button = screen.getByText('Выйти');

    fireEvent.click(button);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('обрабатывает ошибку при выходе', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Ошибка выхода');
    (supabase.auth.signOut as jest.Mock).mockRejectedValueOnce(error);

    render(<LogoutButton />);
    const button = screen.getByText('Выйти');

    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка при выходе из системы:',
        error
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('применяет переданный className', () => {
    const className = 'custom-class';
    render(<LogoutButton className={className} />);
    const button = screen.getByText('Выйти');
    expect(button).toHaveClass(className);
  });
});
