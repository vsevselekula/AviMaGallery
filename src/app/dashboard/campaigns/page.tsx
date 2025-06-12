'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignList } from '@/components/features/CampaignList';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        setCampaigns(data as Campaign[]);
      }
    };

    fetchCampaigns();
  }, [supabase]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
  };

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Все кампании</h1>
        <p className="text-gray-400">Управление рекламными кампаниями</p>
      </div>

      <CampaignList campaigns={campaigns} onCampaignUpdated={handleCampaignUpdated} />
    </main>
  );
} 