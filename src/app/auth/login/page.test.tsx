import { render, screen } from '@testing-library/react';
import LoginPage from './page';

// Мокаем модуль supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginPage', () => {
  it('renders login page with login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });
});
