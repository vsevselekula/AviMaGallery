import { useState, useMemo, useCallback } from 'react';
import { Campaign } from '@/types/campaign';

export interface FilterState {
  searchQuery: string;
  selectedVerticals: string[];
  selectedTypes: string[];
}

export function useCampaignFilters(campaigns: Campaign[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Функция для поиска по всем полям кампании
  const searchInCampaign = useCallback(
    (campaign: Campaign, query: string): boolean => {
      if (!query) return true;

      const searchFields = [
        campaign.campaign_name,
        campaign.campaign_type,
        campaign.campaign_vertical,
        campaign.key_message,
        campaign.description,
        campaign.slogan,
        campaign.geo,
        campaign.audience,
        campaign.type,
        ...(campaign.objectives || []),
        ...(campaign.channels || []),
        ...(campaign.targets || []),
      ];

      const searchText = searchFields
        .filter((field) => field)
        .join(' ')
        .toLowerCase();

      return query
        .toLowerCase()
        .split(' ')
        .every((term) => searchText.includes(term));
    },
    []
  );

  // Фильтрация кампаний
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Поиск по тексту
    if (searchQuery.trim()) {
      filtered = filtered.filter((campaign) =>
        searchInCampaign(campaign, searchQuery.trim())
      );
    }

    // Фильтр по вертикалям
    if (selectedVerticals.length > 0) {
      filtered = filtered.filter((campaign) =>
        selectedVerticals.includes(campaign.campaign_vertical)
      );
    }

    // Фильтр по типам кампаний
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((campaign) =>
        selectedTypes.includes(campaign.campaign_type)
      );
    }

    return filtered;
  }, [
    campaigns,
    searchQuery,
    selectedVerticals,
    selectedTypes,
    searchInCampaign,
  ]);

  // Обработчики для мультифильтров
  const toggleVertical = useCallback((verticalName: string) => {
    setSelectedVerticals((prev) =>
      prev.includes(verticalName)
        ? prev.filter((v) => v !== verticalName)
        : [...prev, verticalName]
    );
  }, []);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedVerticals([]);
    setSelectedTypes([]);
  }, []);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedVerticals.length > 0 ||
    selectedTypes.length > 0;

  return {
    // Состояние
    searchQuery,
    selectedVerticals,
    selectedTypes,
    filteredCampaigns,
    hasActiveFilters,

    // Действия
    setSearchQuery,
    toggleVertical,
    toggleType,
    clearAllFilters,
  };
}
