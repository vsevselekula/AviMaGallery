'use client';

import { useState } from 'react';
import { Campaign } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { CampaignModal } from './CampaignModal';

interface HeroBannerProps {
  campaigns: Campaign[];
  className?: string;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function HeroBanner({
  campaigns,
  className,
  onCampaignUpdated,
}: HeroBannerProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  const activeCampaigns = campaigns.filter((campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.flight_period.start_date);
    const endDate = new Date(campaign.flight_period.end_date);
    return now >= startDate && now <= endDate;
  });

  const handleCampaignClick = (campaign: Campaign) => {
    if (!isAutoPlaying) return;
    setCurrentCampaign(campaign);
    setIsAutoPlaying(false);
  };

  const handleCloseModal = () => {
    setCurrentCampaign(null);
    setIsAutoPlaying(true);
  };

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    onCampaignUpdated?.(updatedCampaign);
    setCurrentCampaign(null);
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-blue-600 to-blue-800 p-8 ${className || ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns.slice(0, 3).map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => handleCampaignClick(campaign)}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={getVerticalColorClass(campaign.campaign_vertical)}
                >
                  {campaign.campaign_vertical}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium border border-white text-white bg-transparent">
                  {campaign.campaign_type}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {campaign.campaign_name}
              </h3>
              <p className="text-gray-200 mb-4">{campaign.key_message}</p>
              <div className="text-sm text-gray-300">
                {format(
                  new Date(campaign.flight_period.start_date),
                  'dd.MM.yyyy',
                  { locale: ru }
                )}{' '}
                -{' '}
                {format(
                  new Date(campaign.flight_period.end_date),
                  'dd.MM.yyyy',
                  { locale: ru }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentCampaign && (
        <CampaignModal
          campaign={currentCampaign}
          onClose={handleCloseModal}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
}
