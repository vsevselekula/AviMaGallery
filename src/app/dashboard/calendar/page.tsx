'use client';

import { CampaignCalendar } from '@/components/features/CampaignCalendar';
import { Campaign } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Calendar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      console.log('Fetching campaigns for Calendar page from Supabase...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns for Calendar page:', error);
      } else {
        console.log('Successfully fetched campaigns for Calendar page:', data);
        setCampaigns(data as Campaign[]);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center text-white text-xl">
        <LoadingSpinner />
        <p className="mt-4">Загрузка календаря кампаний...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Календарь рекламных кампаний</h1>
        <p className="text-gray-400">Обзор кампаний по месяцам</p>
      </div>
      <CampaignCalendar campaigns={campaigns} />
    </main>
  );
} 