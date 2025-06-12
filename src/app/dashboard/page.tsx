'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignList } from '@/components/features/CampaignList';
import { HeroBanner } from '@/components/features/HeroBanner';

export default function DashboardPage() {
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
    <div className="flex-1">
      <HeroBanner campaigns={campaigns} onCampaignUpdated={handleCampaignUpdated} />
      <div className="px-8">
        <CampaignList 
          campaigns={campaigns}
          title="Все кампании"
          description="Полный список всех кампаний"
          onCampaignUpdated={handleCampaignUpdated}
        />
      </div>
    </div>
  );
} 