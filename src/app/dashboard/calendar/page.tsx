'use client';

import { CampaignCalendar } from '@/components/features/CampaignCalendar';

export default function CalendarPage() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Календарь кампаний
        </h1>
        <p className="text-gray-400">Обзор кампаний по месяцам и годам</p>
      </div>
      <CampaignCalendar />
    </main>
  );
}
