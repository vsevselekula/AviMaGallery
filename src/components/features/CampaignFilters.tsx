'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Campaign } from '@/types/campaign';
import { GenericBadge } from '@/components/ui/CampaignBadges';

interface Vertical {
  id: string;
  name: string;
}

interface CampaignFiltersProps {
  campaigns: Campaign[];
  searchQuery: string;
  selectedVerticals: string[];
  selectedTypes: string[];
  hasActiveFilters: boolean;
  onSearchChange: (query: string) => void;
  onToggleVertical: (vertical: string) => void;
  onToggleType: (type: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function CampaignFilters({
  campaigns,
  searchQuery,
  selectedVerticals,
  selectedTypes,
  hasActiveFilters,
  onSearchChange,
  onToggleVertical,
  onToggleType,
  onClearAll,
  className = '',
}: CampaignFiltersProps) {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const supabase = createClientComponentClient();

  // Проверяем что компонент смонтирован на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Загружаем вертикали из Supabase
  useEffect(() => {
    if (!isMounted) return;

    const fetchVerticals = async () => {
      try {
        // Используем таймаут для быстрого фоллбека если таблица недоступна
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const fetchPromise = supabase
          .from('verticals')
          .select('id, name')
          .order('name');

        const { data, error } = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as { data: Vertical[] | null; error: Error | null };

        if (error) {
          throw error;
        } else {
          setVerticals(data || []);
        }
      } catch (error) {
        console.error('Error fetching verticals, using fallback:', error);
        // Fallback: используем данные из кампаний
        const uniqueVerticals = Array.from(
          new Set(campaigns.map((c) => c.campaign_vertical).filter(Boolean))
        ).map((name, index) => ({ id: `${index}`, name }));
        setVerticals(uniqueVerticals);
      } finally {
        setLoading(false);
      }
    };

    fetchVerticals();
  }, [supabase, campaigns, isMounted]);

  // Получаем уникальные типы кампаний
  const campaignTypes = useMemo(() => {
    return Array.from(
      new Set(campaigns.map((c) => c.campaign_type).filter(Boolean))
    ).sort();
  }, [campaigns]);

  // Не показываем ничего пока компонент не смонтирован (предотвращение мигания при гидратации)
  if (!isMounted) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        {/* Показываем финальное состояние для избежания мигания */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск по всем данным кампаний..."
              value=""
              onChange={() => {}}
              className="block w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled
            />
          </div>
          <div className="relative">
            <button
              disabled
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm whitespace-nowrap opacity-50"
            >
              Вертикали
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <div className="relative">
            <button
              disabled
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm whitespace-nowrap opacity-50"
            >
              Типы
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        {/* Основная строка с фильтрами - имитируем финальный лейаут */}
        <div className="flex items-center gap-4">
          {/* Строка поиска */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="block w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-sm animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-1/3"></div>
            </div>
          </div>

          {/* Кнопки фильтров */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-sm whitespace-nowrap animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-16"></div>
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-sm whitespace-nowrap animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-12"></div>
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* Основная строка с фильтрами */}
      <div className="flex items-center gap-4">
        {/* Строка поиска */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Поиск по всем данным кампаний..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Дропдаун вертикалей */}
        <div className="relative">
          <VerticalDropdown
            verticals={verticals}
            selectedVerticals={selectedVerticals}
            campaigns={campaigns}
            onToggleVertical={onToggleVertical}
          />
        </div>

        {/* Дропдаун типов кампаний */}
        <div className="relative">
          <TypeDropdown
            campaignTypes={campaignTypes}
            selectedTypes={selectedTypes}
            campaigns={campaigns}
            onToggleType={onToggleType}
          />
        </div>

        {/* Кнопка очистки */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="px-3 py-2 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
          >
            Очистить
          </button>
        )}
      </div>

      {/* Активные фильтры чипами */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedVerticals.map((vertical) => (
            <GenericBadge
              key={vertical}
              color="blue"
              size="sm"
              className="inline-flex items-center"
            >
              {vertical}
              <button
                onClick={() => onToggleVertical(vertical)}
                className="ml-1 hover:text-blue-200"
              >
                ×
              </button>
            </GenericBadge>
          ))}
          {selectedTypes.map((type) => (
            <GenericBadge
              key={type}
              color="green"
              size="sm"
              className="inline-flex items-center"
            >
              {type}
              <button
                onClick={() => onToggleType(type)}
                className="ml-1 hover:text-green-200"
              >
                ×
              </button>
            </GenericBadge>
          ))}
        </div>
      )}
    </div>
  );
}

// Компонент дропдауна для вертикалей
function VerticalDropdown({
  verticals,
  selectedVerticals,
  campaigns,
  onToggleVertical,
}: {
  verticals: Vertical[];
  selectedVerticals: string[];
  campaigns: Campaign[];
  onToggleVertical: (vertical: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm whitespace-nowrap"
      >
        Вертикали
        {selectedVerticals.length > 0 && (
          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs">
            {selectedVerticals.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-gray-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
            {verticals.map((vertical) => {
              const count = campaigns.filter(
                (c) => c.campaign_vertical === vertical.name
              ).length;
              const isSelected = selectedVerticals.includes(vertical.name);

              return (
                <button
                  key={vertical.id}
                  onClick={() => onToggleVertical(vertical.name)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-600 transition-colors text-sm flex items-center justify-between ${
                    isSelected ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  <span>{vertical.name}</span>
                  <span className="text-xs text-gray-400">({count})</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Компонент дропдауна для типов кампаний
function TypeDropdown({
  campaignTypes,
  selectedTypes,
  campaigns,
  onToggleType,
}: {
  campaignTypes: string[];
  selectedTypes: string[];
  campaigns: Campaign[];
  onToggleType: (type: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm whitespace-nowrap"
      >
        Типы
        {selectedTypes.length > 0 && (
          <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs">
            {selectedTypes.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-gray-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
            {campaignTypes.map((type) => {
              const count = campaigns.filter(
                (c) => c.campaign_type === type
              ).length;
              const isSelected = selectedTypes.includes(type);

              return (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-600 transition-colors text-sm flex items-center justify-between ${
                    isSelected ? 'bg-green-600 text-white' : 'text-gray-300'
                  }`}
                >
                  <span>{type}</span>
                  <span className="text-xs text-gray-400">({count})</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
