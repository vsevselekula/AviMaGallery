'use client';

import { useState, useEffect, useMemo } from 'react';
import { Campaign } from '@/types/campaign';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignFormModal } from './campaign/CampaignFormModal';
import { getVerticalColorClass } from '@/lib/utils';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isSameMonth,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { ru } from 'date-fns/locale';

export function CampaignCalendar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns_v2')
        .select('*')
        .order('flight_period->>start_date', { ascending: true });

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        setCampaigns(data as Campaign[]);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [supabase]);

  // Создаем массив месяцев для текущего года
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 0, 1));
  const monthsOfYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Группируем кампании по месяцам
  const campaignsByMonth = useMemo(() => {
    const grouped: { [key: string]: Campaign[] } = {};

    // Инициализируем все месяцы года пустыми массивами
    monthsOfYear.forEach((month) => {
      const monthKey = format(month, 'yyyy-MM');
      grouped[monthKey] = [];
    });

    campaigns.forEach((campaign) => {
      if (
        campaign.flight_period?.start_date &&
        campaign.flight_period?.end_date
      ) {
        const startDate = parseISO(campaign.flight_period.start_date);
        const endDate = parseISO(campaign.flight_period.end_date);

        monthsOfYear.forEach((month) => {
          const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
          const monthEnd = new Date(
            month.getFullYear(),
            month.getMonth() + 1,
            0
          );

          // Проверяем, пересекается ли кампания с месяцем
          if (
            isWithinInterval(monthStart, { start: startDate, end: endDate }) ||
            isWithinInterval(monthEnd, { start: startDate, end: endDate }) ||
            (startDate <= monthStart && endDate >= monthEnd)
          ) {
            const monthKey = format(month, 'yyyy-MM');
            if (!grouped[monthKey].some((c) => c.id === campaign.id)) {
              grouped[monthKey].push(campaign);
            }
          }
        });
      }
    });

    return grouped;
  }, [campaigns, monthsOfYear]);

  const getVerticalBgColor = (vertical: string) => {
    const verticalColor = getVerticalColorClass(vertical);
    // Конвертируем HEX в стиль для использования в className через CSS переменную
    return {
      backgroundColor: verticalColor.backgroundColor,
      color: vertical === 'Авито' ? '#000000' : '#FFFFFF',
    };
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear((prev) => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  const getAvailableYears = () => {
    if (campaigns.length === 0) return [currentYear];

    const years = new Set<number>();
    campaigns.forEach((campaign) => {
      if (campaign.flight_period?.start_date) {
        const year = new Date(campaign.flight_period.start_date).getFullYear();
        years.add(year);
      }
    });

    return Array.from(years).sort();
  };

  const availableYears = getAvailableYears();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Загрузка календаря...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Календарь кампаний</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateYear('prev')}
            disabled={currentYear <= Math.min(...availableYears)}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <h3 className="text-xl text-white min-w-[80px] text-center">
            {currentYear}
          </h3>
          <button
            onClick={() => navigateYear('next')}
            disabled={currentYear >= Math.max(...availableYears)}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {/* Быстрый переключатель годов */}
      {availableYears.length > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setCurrentYear(year)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                year === currentYear
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Календарная сетка по месяцам */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monthsOfYear.map((month) => {
            const monthKey = format(month, 'yyyy-MM');
            const monthCampaigns = campaignsByMonth[monthKey] || [];
            const isCurrentMonth = isSameMonth(month, new Date());

            return (
              <div
                key={monthKey}
                className={`min-h-[250px] p-4 border border-gray-700 rounded-lg bg-gray-800 ${
                  isCurrentMonth ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Заголовок месяца */}
                <div
                  className={`text-center mb-3 pb-2 border-b border-gray-700 ${
                    isCurrentMonth ? 'text-blue-400' : 'text-white'
                  }`}
                >
                  <h4 className="text-lg font-semibold">
                    {format(month, 'LLLL', { locale: ru })}
                  </h4>
                  <div className="text-xs text-gray-400 mt-1">
                    {monthCampaigns.length} кампани
                    {monthCampaigns.length === 1
                      ? 'я'
                      : monthCampaigns.length < 5
                        ? 'и'
                        : 'й'}
                  </div>
                </div>

                {/* Кампании в месяце */}
                <div className="space-y-2">
                  {monthCampaigns.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Нет кампаний
                    </div>
                  ) : (
                    monthCampaigns.map((campaign) => {
                      const verticalStyle = getVerticalBgColor(
                        campaign.campaign_vertical
                      );
                      return (
                        <div
                          key={campaign.id}
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={verticalStyle}
                          title={`${campaign.campaign_name} (${campaign.campaign_vertical})`}
                        >
                          <div className="font-medium truncate">
                            {campaign.campaign_name}
                          </div>
                          <div className="opacity-90 truncate mt-1">
                            {campaign.campaign_vertical}
                          </div>
                          {campaign.flight_period && (
                            <div className="opacity-75 text-xs mt-1">
                              {format(
                                new Date(campaign.flight_period.start_date),
                                'dd.MM',
                                { locale: ru }
                              )}{' '}
                              -
                              {format(
                                new Date(campaign.flight_period.end_date),
                                'dd.MM',
                                { locale: ru }
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Легенда вертикалей */}
      <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
        {Array.from(new Set(campaigns.map((c) => c.campaign_vertical)))
          .sort()
          .map((vertical) => {
            const verticalStyle = getVerticalBgColor(vertical);
            return (
              <div key={vertical} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: verticalStyle.backgroundColor }}
                ></div>
                <span className="text-gray-300">{vertical}</span>
              </div>
            );
          })}
      </div>

      {/* Информация о текущем году */}
      <div className="text-center text-gray-400 text-sm">
        <p>
          Всего кампаний в {currentYear} году:{' '}
          <span className="text-white font-medium">
            {Object.values(campaignsByMonth).flat().length}
          </span>
        </p>
      </div>

      {selectedCampaign && (
        <CampaignFormModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}
