'use client';

import { useState, useMemo } from 'react';
import { Campaign } from '@/lib/types';
import { CampaignModal } from './CampaignModal';
import { CampaignCard } from './CampaignCard';
import { useReactions } from '@/hooks/useReactions';

interface CampaignListProps {
  campaigns: Campaign[];
  title?: string;
  description?: string;
  hideVerticalFilter?: boolean;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignList({
  campaigns,
  title,
  description,
  hideVerticalFilter,
  onCampaignUpdated,
}: CampaignListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedVertical, setSelectedVertical] = useState<string>('');

  // Получаем реакции для всех кампаний
  const campaignIds = useMemo(() => campaigns.map(c => c.id), [campaigns]);
  const { reactionCounts, refetch: refetchReactions } = useReactions(campaignIds);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    if (onCampaignUpdated) {
      onCampaignUpdated(updatedCampaign);
    }
    setSelectedCampaign(null);
  };

  const handleModalClose = () => {
    setSelectedCampaign(null);
    // Обновляем реакции при закрытии модального окна
    refetchReactions();
    // Дополнительное обновление через небольшую задержку на случай задержки синхронизации
    setTimeout(() => {
      refetchReactions();
    }, 500);
  };

  const uniqueTypes = useMemo(
    () => Array.from(new Set(campaigns.map((c) => c.campaign_type))).sort(),
    [campaigns]
  );

  const uniqueVerticals = useMemo(
    () => Array.from(new Set(campaigns.map((c) => c.campaign_vertical))).sort(),
    [campaigns]
  );

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        searchQuery === '' ||
        campaign.campaign_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (campaign.key_message || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === '' ||
        campaign.campaign_type.toLowerCase() === selectedType.toLowerCase();
      const matchesVertical =
        selectedVertical === '' ||
        campaign.campaign_vertical === selectedVertical;

      return matchesSearch && matchesType && matchesVertical;
    });
  }, [campaigns, searchQuery, selectedType, selectedVertical]);

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          )}
          {description && <p className="text-gray-400">{description}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="col-span-full md:col-span-1">
          <input
            type="text"
            placeholder="Поиск по названию или ключевому сообщению..."
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-span-full md:col-span-1">
          <select
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Все типы кампаний</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {!hideVerticalFilter && (
          <div className="col-span-full md:col-span-1">
            <select
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedVertical}
              onChange={(e) => setSelectedVertical(e.target.value)}
            >
              <option value="">Все вертикали</option>
              {uniqueVerticals.map((vertical) => (
                <option key={vertical} value={vertical}>
                  {vertical}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} onClick={() => setSelectedCampaign(campaign)}>
            <CampaignCard 
              campaign={campaign} 
              reactionCounts={reactionCounts[campaign.id] || {}}
              showReactions={true}
            />
          </div>
        ))}
      </div>

      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={handleModalClose}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
}
