import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('h-11');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('custom-class');
  });
});
