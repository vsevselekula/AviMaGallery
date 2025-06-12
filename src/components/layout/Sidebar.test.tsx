import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('Avito Gallery')).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Домашняя страница')).toBeInTheDocument();
    expect(screen.getByText('Аналитика')).toBeInTheDocument();
    expect(screen.getByText('Календарь РК')).toBeInTheDocument();
    expect(screen.getByText('Вертикали')).toBeInTheDocument();
  });

  it('renders user profile', () => {
    render(<Sidebar />);
    expect(screen.getByText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByText('admin@avito.ru')).toBeInTheDocument();
  });

  it('renders menu icons', () => {
    render(<Sidebar />);
    expect(screen.getByText('🏠')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
  });
}); 