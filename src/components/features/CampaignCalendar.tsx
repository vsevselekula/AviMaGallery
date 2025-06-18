'use client';

import { useState, useEffect, useMemo } from 'react';
import { Campaign } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignFormModal } from './campaign/CampaignFormModal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function CampaignCalendar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Группируем кампании по дням
  const campaignsByDay = useMemo(() => {
    const grouped: { [key: string]: Campaign[] } = {};
    
    campaigns.forEach(campaign => {
      if (campaign.flight_period?.start_date && campaign.flight_period?.end_date) {
        const startDate = parseISO(campaign.flight_period.start_date);
        const endDate = parseISO(campaign.flight_period.end_date);
        
        calendarDays.forEach(day => {
          if (day >= startDate && day <= endDate) {
            const dayKey = format(day, 'yyyy-MM-dd');
            if (!grouped[dayKey]) {
              grouped[dayKey] = [];
            }
            grouped[dayKey].push(campaign);
          }
        });
      }
    });
    
    return grouped;
  }, [campaigns, calendarDays]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'planned':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

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
        <h2 className="text-2xl font-bold text-white">
          Календарь кампаний
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <h3 className="text-xl text-white min-w-[200px] text-center">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Календарная сетка */}
      <div className="bg-gray-800 rounded-lg p-6">
        {/* Заголовки дней недели */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-gray-400 font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Дни месяца */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayCampaigns = campaignsByDay[dayKey] || [];
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={dayKey}
                className={`min-h-[100px] p-2 border border-gray-700 rounded ${
                  !isSameMonth(day, currentDate) 
                    ? 'bg-gray-900 text-gray-600' 
                    : 'bg-gray-800 text-white'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                {/* Кампании в этот день */}
                <div className="space-y-1">
                  {dayCampaigns.slice(0, 3).map(campaign => (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(campaign.status)} text-white`}
                      title={campaign.campaign_name}
                    >
                      {campaign.campaign_name.length > 15 
                        ? `${campaign.campaign_name.substring(0, 15)}...`
                        : campaign.campaign_name
                      }
                    </div>
                  ))}
                  
                  {/* Показываем количество дополнительных кампаний */}
                  {dayCampaigns.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{dayCampaigns.length - 3} еще
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Активные</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Запланированные</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-300">Завершенные</span>
        </div>
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
