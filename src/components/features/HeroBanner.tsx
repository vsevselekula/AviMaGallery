'use client';

import { useState } from 'react';
import { Campaign } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { CampaignModal } from './CampaignModal';
import Image from 'next/image';

interface HeroBannerProps {
  campaigns: Campaign[];
  className?: string;
  onCampaignUpdated: (updatedCampaign: Campaign) => void;
}

export function HeroBanner({ campaigns, className, onCampaignUpdated }: HeroBannerProps) {
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  const activeCampaigns = campaigns.filter(campaign => {
    const now = new Date();
    const startDate = new Date(campaign.flight_period.start_date);
    const endDate = new Date(campaign.flight_period.end_date);
    return now >= startDate && now <= endDate;
  });

  const heroCampaign = activeCampaigns.length > 0 ? activeCampaigns[0] : null;

  const handleCampaignClick = (campaign: Campaign) => {
    setCurrentCampaign(campaign);
  };

  const handleCloseModal = () => {
    setCurrentCampaign(null);
  };

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    onCampaignUpdated(updatedCampaign);
    setCurrentCampaign(null);
  };

  if (!heroCampaign) {
    return (
      <div className={`relative bg-gray-900 p-8 text-white flex items-center justify-center min-h-[300px] ${className || ''}`}>
        <p className="text-xl">Нет активных кампаний для отображения.</p>
      </div>
    );
  }

  const hasImage = heroCampaign.image_url && heroCampaign.image_url.startsWith('http');
  const isActive = new Date(heroCampaign.flight_period.end_date) > new Date();

  return (
    <div className={`relative w-full overflow-hidden ${className || ''}`} style={{ minHeight: '400px' }}>
      {hasImage && heroCampaign.image_url ? (
        <Image
          src={heroCampaign.image_url}
          alt={heroCampaign.campaign_name}
          fill
          style={{ objectFit: 'cover' }}
          className="z-0"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 z-0"></div>
      )}

      {/* Overlay for glass blur effect - now just for centering content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
        <div className="max-w-7xl mx-auto w-full text-white">
          <div className="bg-white/20 p-8 rounded-xl backdrop-blur-md max-w-2xl relative">
            {isActive && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                ON AIR
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={getVerticalColorClass(heroCampaign.campaign_vertical)}
              >
                {heroCampaign.campaign_vertical}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium border border-white text-white bg-transparent">
                {heroCampaign.campaign_type}
              </span>
            </div>
            <h3 className="text-4xl font-extrabold mb-4">{heroCampaign.campaign_name}</h3>
            <p className="text-lg text-gray-200 mb-6">{heroCampaign.key_message}</p>
            <div className="text-base text-gray-300">
              {format(new Date(heroCampaign.flight_period.start_date), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(heroCampaign.flight_period.end_date), 'dd.MM.yyyy', { locale: ru })}
            </div>
            <button
              onClick={() => handleCampaignClick(heroCampaign)}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Подробнее
            </button>
          </div>
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