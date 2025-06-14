'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignList } from '@/components/features/CampaignList';
import { HeroBanner } from '@/components/features/HeroBanner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns_v2')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns_v2:', error);
        setLoading(false);
      } else {
        setCampaigns(data as Campaign[]);
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [supabase]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <HeroBanner campaigns={campaigns} />
      <div className="px-8 mt-8">
        <CampaignList 
          campaigns={campaigns} 
          title="Все кампании" 
          onCampaignUpdated={handleCampaignUpdated}
        />
      </div>
    </div>
  );
}
