'use client';

import { Campaign } from '@/types/campaign';
import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isValidImageUrl } from '@/lib/imageUtils';
import {
  VerticalBadge,
  GenericBadge,
  StatusBadge,
} from '@/components/ui/CampaignBadges';
import Image from 'next/image';

interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignModal({ campaign, onClose }: CampaignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Обработчик клика вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Обработчик ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const hasImage = isValidImageUrl(campaign.image_url);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              {campaign.campaign_name}
            </h2>
            <StatusBadge
              status={
                (campaign.status as 'active' | 'completed' | 'planned') ||
                'planned'
              }
              size="sm"
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Hero Section */}
          {hasImage && (
            <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
              <Image
                src={campaign.image_url!}
                alt={campaign.campaign_name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          )}

          {/* Campaign Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Вертикаль
                </label>
                <VerticalBadge vertical={campaign.campaign_vertical} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Тип кампании
                </label>
                <p className="text-white">{campaign.campaign_type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  География
                </label>
                <p className="text-white">{campaign.geo || 'Не указано'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Аудитория
                </label>
                <p className="text-white">
                  {campaign.audience || 'Не указано'}
                </p>
              </div>
            </div>

            {/* Dates and Status */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Период проведения
                </label>
                <p className="text-white">
                  {campaign.flight_period?.start_date &&
                  campaign.flight_period?.end_date
                    ? `${formatDate(campaign.flight_period.start_date)} - ${formatDate(campaign.flight_period.end_date)}`
                    : 'Не указано'}
                </p>
              </div>

              {campaign.slogan && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Слоган
                  </label>
                  <p className="text-white">{campaign.slogan}</p>
                </div>
              )}

              {campaign.type && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Тип
                  </label>
                  <p className="text-white">{campaign.type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Message */}
          {campaign.key_message && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ключевое сообщение
              </label>
              <p className="text-white bg-gray-800 p-4 rounded-lg">
                {campaign.key_message}
              </p>
            </div>
          )}

          {/* Description */}
          {campaign.description && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание
              </label>
              <p className="text-white bg-gray-800 p-4 rounded-lg">
                {campaign.description}
              </p>
            </div>
          )}

          {/* Objectives */}
          {campaign.objectives && campaign.objectives.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Цели
              </label>
              <div className="flex flex-wrap gap-2">
                {campaign.objectives.map((objective, index) => (
                  <GenericBadge key={index} color="blue">
                    {objective}
                  </GenericBadge>
                ))}
              </div>
            </div>
          )}

          {/* Channels */}
          {campaign.channels && campaign.channels.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Каналы
              </label>
              <div className="flex flex-wrap gap-2">
                {campaign.channels.map((channel, index) => (
                  <GenericBadge key={index} color="green">
                    {channel}
                  </GenericBadge>
                ))}
              </div>
            </div>
          )}

          {/* Targets */}
          {campaign.targets && campaign.targets.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Цели
              </label>
              <div className="flex flex-wrap gap-2">
                {campaign.targets.map((target, index) => (
                  <GenericBadge key={index} color="purple">
                    {target}
                  </GenericBadge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {campaign.links && campaign.links.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ссылки
              </label>
              <div className="space-y-2">
                {campaign.links.map((link, index) => (
                  <a
                    key={index}
                    href={typeof link === 'string' ? link : link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 underline"
                  >
                    {typeof link === 'string' ? link : link.label || link.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {campaign.video_url && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Видео
              </label>
              <div className="bg-gray-800 p-4 rounded-lg">
                <video
                  controls
                  className="w-full max-h-96 rounded"
                  preload="metadata"
                >
                  <source src={campaign.video_url} type="video/mp4" />
                  Ваш браузер не поддерживает воспроизведение видео.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
