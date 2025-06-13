import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVerticalColorClass(vertical: string): React.CSSProperties {
  const colors: Record<string, string> = {
    Недвижимость: 'background-color: #FF6B6B',
    Авто: 'background-color: #4ECDC4',
    Работа: 'background-color: #45B7D1',
    Услуги: 'background-color: #96CEB4',
    'Личные вещи': 'background-color: #FFEEAD',
    'Для дома и дачи': 'background-color: #D4A5A5',
    Электроника: 'background-color: #9B59B6',
    'Хобби и отдых': 'background-color: #3498DB',
    Животные: 'background-color: #E67E22',
    'Готовый бизнес': 'background-color: #2ECC71',
    Другое: 'background-color: #95A5A6',
  };

  return {
    backgroundColor: colors[vertical] || colors['Другое'],
  };
}
