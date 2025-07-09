import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Campaign } from '@/types/campaign';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  VerticalBadge,
  CampaignTypeBadge,
} from '@/components/ui/CampaignBadges';

interface CampaignModalHeroProps {
  campaign: Campaign;
  editedCampaign: Campaign;
  isEditing: boolean;
  onImageUpdate: (imageUrl: string) => void;
  onInputChange: (field: keyof Campaign, value: string) => void;
}

export function CampaignModalHero({
  campaign,
  editedCampaign,
  isEditing,
  onImageUpdate,
  onInputChange,
}: CampaignModalHeroProps) {
  return (
    <div className="mt-12 mb-6 -mx-8">
      <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
        {/* Фоновое изображение или видео */}
        {campaign.video_url ? (
          <VideoPlayer
            videoUrl={campaign.video_url}
            posterUrl={campaign.image_url || undefined}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isEditing ? 'blur-md scale-105' : ''
            }`}
          />
        ) : campaign.image_url ? (
          <Image
            src={campaign.image_url}
            alt={campaign.campaign_name}
            fill
            className={`object-cover transition-all duration-300 ${
              isEditing ? 'blur-md scale-105' : ''
            }`}
            priority
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center transition-all duration-300 ${
              isEditing ? 'blur-md scale-105' : ''
            }`}
          >
            <span className="text-6xl opacity-50">📱</span>
          </div>
        )}

        {/* Градиент */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isEditing
              ? 'bg-gradient-to-t from-black/80 to-black/30'
              : 'bg-gradient-to-t from-black/50 to-transparent'
          }`}
        />

        {/* Загрузка изображения для редактирования */}
        {isEditing && (
          <div className="absolute top-4 left-4 max-w-xs">
            <ImageUpload
              value={editedCampaign.image_url || undefined}
              onChange={onImageUpdate}
              campaignId={campaign.id}
              className="compact-mode"
              placeholder="Загрузить изображение"
            />
          </div>
        )}

        {/* Основная информация */}
        <div className="absolute bottom-4 left-8 right-8">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedCampaign.campaign_name}
                onChange={(e) => onInputChange('campaign_name', e.target.value)}
                className="w-full text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white"
                placeholder="Название кампании"
              />
              <input
                type="text"
                value={editedCampaign.slogan || ''}
                onChange={(e) => onInputChange('slogan', e.target.value)}
                className="w-full text-lg bg-transparent border-b border-white/30 text-white/90 placeholder-white/70 focus:outline-none focus:border-white"
                placeholder="Слоган кампании"
              />
            </div>
          ) : (
            <div>
              <div className="flex gap-2 flex-wrap items-center mb-3">
                <VerticalBadge
                  vertical={campaign.campaign_vertical}
                  size="sm"
                />
                <CampaignTypeBadge type={campaign.campaign_type} size="sm" />
                {campaign.flight_period && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white">
                    {format(
                      new Date(campaign.flight_period.start_date),
                      'dd MMM',
                      {
                        locale: ru,
                      }
                    )}{' '}
                    -{' '}
                    {format(
                      new Date(campaign.flight_period.end_date),
                      'dd MMM yyyy',
                      {
                        locale: ru,
                      }
                    )}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {campaign.campaign_name}
              </h1>
              {campaign.slogan && (
                <p className="text-lg text-white/90 font-medium">
                  {campaign.slogan}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
