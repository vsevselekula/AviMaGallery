'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/types/campaign';
import { CampaignCard } from './CampaignCard';
import { CampaignFilters } from './CampaignFilters';
import { useReactionsSimple as useReactions } from '@/hooks/useReactionsSimple';
import { useCampaignFilters } from '@/hooks/useCampaignFilters';

interface CampaignListProps {
  campaigns: Campaign[];
  title?: string;
  description?: string;
  hideFilters?: boolean;
}

export function CampaignList({
  campaigns,
  title,
  description,
  hideFilters,
}: CampaignListProps) {
  const router = useRouter();

  // Получаем реакции для всех кампаний - мемоизируем для предотвращения пересоздания
  const campaignIds = useMemo(() => campaigns.map((c) => c.id), [campaigns]);
  const { reactionCounts } = useReactions(campaignIds);

  // Используем кастомный хук для фильтрации
  const {
    searchQuery,
    selectedVerticals,
    selectedTypes,
    filteredCampaigns,
    hasActiveFilters,
    setSearchQuery,
    toggleVertical,
    toggleType,
    clearAllFilters,
  } = useCampaignFilters(campaigns);

  const handleCampaignClick = (campaign: Campaign) => {
    // Добавляем параметр campaign к текущему URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('campaign', campaign.id);
    router.push(currentUrl.pathname + currentUrl.search);
  };

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          {description && (
            <p className="text-gray-400 text-lg">{description}</p>
          )}
        </div>
      )}

      {/* Новая система фильтров */}
      {!hideFilters && (
        <CampaignFilters
          campaigns={campaigns}
          searchQuery={searchQuery}
          selectedVerticals={selectedVerticals}
          selectedTypes={selectedTypes}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchQuery}
          onToggleVertical={toggleVertical}
          onToggleType={toggleType}
          onClearAll={clearAllFilters}
        />
      )}

      {/* Сетка кампаний */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">Кампании не найдены</div>
          <p className="text-gray-500 text-sm mt-2">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => handleCampaignClick(campaign)}
            >
              <CampaignCard
                campaign={campaign}
                reactionCounts={reactionCounts[campaign.id] || {}}
                showReactions={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
