'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/types/campaign';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CampaignBadgeGroup } from '@/components/ui/CampaignBadges';
import Image from 'next/image';
import { isValidImageUrl } from '@/lib/imageUtils';

interface HeroBannerProps {
  campaigns: Campaign[];
  className?: string;
}

export function HeroBanner({ campaigns, className }: HeroBannerProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const router = useRouter();

  const activeCampaigns = campaigns.filter((campaign) => {
    if (!campaign.flight_period) return false;
    const now = new Date();
    const startDate = new Date(campaign.flight_period.start_date);
    const endDate = new Date(campaign.flight_period.end_date);
    return now >= startDate && now <= endDate;
  });

  // Слайдер: автосмена каждые 7 секунд
  useEffect(() => {
    if (activeCampaigns.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activeCampaigns.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeCampaigns.length]);

  // Сброс индекса если число кампаний изменилось
  useEffect(() => {
    setSlideIndex(0);
  }, [activeCampaigns.length]);

  const heroCampaign =
    activeCampaigns.length > 0
      ? activeCampaigns[slideIndex % activeCampaigns.length]
      : null;

  const handleCampaignClick = (campaign: Campaign) => {
    // Добавляем параметр campaign к текущему URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('campaign', campaign.id);
    router.push(currentUrl.pathname + currentUrl.search);
  };

  if (!heroCampaign) {
    return (
      <div
        className={`relative bg-gray-900 p-8 text-white flex items-center justify-center min-h-[300px] ${className || ''}`}
      >
        <p className="text-xl">Нет активных кампаний для отображения.</p>
      </div>
    );
  }

  const hasImage = isValidImageUrl(heroCampaign.image_url);
  const isActive = heroCampaign.flight_period
    ? new Date(heroCampaign.flight_period.end_date) > new Date()
    : false;

  return (
    <div
      className={`relative w-full overflow-hidden ${className || ''}`}
      style={{ minHeight: '400px' }}
    >
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
      <div className="absolute inset-0 z-10 flex items-center justify-start p-8">
        <div className="w-full max-w-none">
          <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl w-full max-w-[90%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[33.333%] max-h-[70%] overflow-hidden relative border border-white/30 shadow-2xl">
            {isActive && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                ON AIR
              </div>
            )}
            <div className="mb-4">
              <CampaignBadgeGroup
                vertical={heroCampaign.campaign_vertical}
                type={heroCampaign.campaign_type}
                className="flex-wrap max-w-sm"
              />
            </div>
            <h3 className="text-3xl font-extrabold mb-3 text-black line-clamp-2">
              {heroCampaign.campaign_name}
            </h3>
            <p className="text-base text-gray-800 mb-4 line-clamp-3">
              {heroCampaign.key_message}
            </p>
            <div className="text-sm text-gray-600 mb-4">
              {heroCampaign.flight_period ? (
                <>
                  {format(
                    new Date(heroCampaign.flight_period.start_date),
                    'dd.MM.yyyy',
                    { locale: ru }
                  )}{' '}
                  -{' '}
                  {format(
                    new Date(heroCampaign.flight_period.end_date),
                    'dd.MM.yyyy',
                    { locale: ru }
                  )}
                </>
              ) : (
                'Даты не указаны'
              )}
            </div>
            <button
              onClick={() => handleCampaignClick(heroCampaign)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Подробнее
            </button>
          </div>
        </div>
      </div>

      {/* Индикаторы слайдера */}
      {activeCampaigns.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeCampaigns.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full border-2 ${idx === slideIndex ? 'bg-white border-white' : 'bg-gray-400 border-gray-400'} transition-all`}
              onClick={() => setSlideIndex(idx)}
              aria-label={`Показать кампанию ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
