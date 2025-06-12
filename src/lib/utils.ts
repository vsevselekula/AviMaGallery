import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getVerticalColorClass = (vertical: string) => {
  switch (vertical) {
    case 'Услуги':
    case 'Работа':
      return { backgroundColor: '#8B5CF6', color: '#FFFFFF' }; // bg-purple-600
    case 'Авто':
      return { backgroundColor: '#3B82F6', color: '#FFFFFF' }; // bg-blue-600
    case 'Недвижимость':
      return { backgroundColor: '#EF4444', color: '#FFFFFF' }; // bg-red-600
    case 'Товары':
      return { backgroundColor: '#22C55E', color: '#FFFFFF' }; // bg-green-600
    case 'Авито':
      return { backgroundColor: '#FFFFFF', color: '#000000' }; // bg-white, text-black
    default:
      return { backgroundColor: '#6B7280', color: '#FFFFFF' }; // bg-gray-500
  }
}; 