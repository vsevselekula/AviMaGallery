import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getVerticalColorClass = (vertical: string) => {
  switch (vertical) {
    case 'Услуги':
    case 'Работа':
      return { backgroundColor: '#8B5CF6' }; // bg-purple-600
    case 'Авто':
      return { backgroundColor: '#3B82F6' }; // bg-blue-600
    case 'Недвижимость':
      return { backgroundColor: '#EF4444' }; // bg-red-600
    case 'Товары':
      return { backgroundColor: '#22C55E' }; // bg-green-600
    case 'Авито':
      return { backgroundColor: '#FFFFFF' }; // bg-white
    default:
      return { backgroundColor: '#6B7280' }; // bg-gray-500
  }
};

export function getCampaignUrl(campaignId: string): string {
  return `/dashboard?campaign=${campaignId}`;
}

export function getCampaignShareUrl(campaignId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/dashboard?campaign=${campaignId}`;
  }
  return `/dashboard?campaign=${campaignId}`;
}
