'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignList } from '@/components/features/CampaignList';

interface Vertical {
  id: string;
  name: string;
  description: string;
}

interface VerticalClientProps {
  verticalName: string;
  initialVertical: Vertical | null;
  initialCampaigns: Campaign[];
}

export function VerticalClient({
  verticalName,
  initialVertical,
  initialCampaigns,
}: VerticalClientProps) {
  const [vertical, setVertical] = useState<Vertical | null>(initialVertical);
  const [verticalCampaigns, setVerticalCampaigns] =
    useState<Campaign[]>(initialCampaigns);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchVertical = async () => {
      const { data, error } = await supabase
        .from('verticals')
        .select('*')
        .eq('name', verticalName)
        .single();

      if (error) {
        console.error('Error fetching vertical:', error);
      } else {
        setVertical(data as Vertical);
      }
    };

    fetchVertical();
  }, [verticalName, supabase]);

  useEffect(() => {
    const fetchVerticalCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('campaign_vertical', verticalName)
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching vertical campaigns:', error);
      } else {
        setVerticalCampaigns(data as Campaign[]);
      }
    };

    fetchVerticalCampaigns();
  }, [verticalName, supabase]);

  if (!vertical) {
    return (
      <main className="flex-1 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Направление не найдено
          </h1>
          <p className="text-gray-400">
            Пожалуйста, проверьте URL и попробуйте снова.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{vertical.name}</h1>
        <p className="text-gray-400">{vertical.description}</p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">
        Кампании направления "{vertical.name}"
      </h2>
      {verticalCampaigns.length > 0 ? (
        <CampaignList campaigns={verticalCampaigns} hideFilters={true} />
      ) : (
        <p className="text-gray-400">Кампаний в этом направлении пока нет.</p>
      )}
    </main>
  );
}
