'use client';

import { useState } from 'react';
import { Campaign } from '@/lib/types';
import { CampaignList } from '@/components/features/CampaignList';

interface CampaignsClientProps {
  initialCampaigns: Campaign[];
}

export function CampaignsClient({ initialCampaigns }: CampaignsClientProps) {
  const [campaigns] = useState<Campaign[]>(initialCampaigns);

  // const handleCampaignUpdated = (updatedCampaign: Campaign) => {
  //   setCampaigns((prevCampaigns) =>
  //     prevCampaigns.map((campaign) =>
  //       campaign.id === updatedCampaign.id ? updatedCampaign : campaign
  //     )
  //   );
  // };

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Все кампании</h1>
        <p className="text-gray-400">Управление рекламными кампаниями</p>
      </div>

      <CampaignList
        campaigns={campaigns}
      />
    </main>
  );
}
