'use client';

import { Campaign } from '@/lib/types';
import { format, getYear, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth, isSameYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn, getVerticalColorClass } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { CampaignModal } from './CampaignModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CampaignCalendarProps {
  campaigns: Campaign[];
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignCalendar({ campaigns, onCampaignUpdated }: CampaignCalendarProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();
        if (roleData) {
          setIsAdmin(roleData.role === 'admin' || roleData.role === 'super_admin');
        }
      }
    };

    fetchUserRole();
  }, []);

  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    const currentYear = getYear(new Date());
    const availableYears = Array.from(new Set(campaigns.map(c => getYear(new Date(c.flight_period.start_date))))).sort((a, b) => b - a);
    return availableYears.includes(currentYear) ? currentYear : (availableYears.length > 0 ? availableYears[0] : 'all');
  });

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(campaigns.map(c => getYear(new Date(c.flight_period.start_date))))).sort((a, b) => b - a);
    return years;
  }, [campaigns]);

  const campaignsForSelectedYear = useMemo(() => {
    if (selectedYear === 'all') return campaigns;
    return campaigns.filter(campaign => isSameYear(new Date(campaign.flight_period.start_date), new Date(selectedYear, 0, 1)));
  }, [campaigns, selectedYear]);

  const groupedCampaigns = useMemo(() => {
    const groups: { [key: string]: Campaign[] } = {};
    
    const currentYearDate = new Date(selectedYear === 'all' ? getYear(new Date()) : selectedYear, 0, 1);
    const monthsOfYear = eachMonthOfInterval({
      start: startOfYear(currentYearDate),
      end: endOfYear(currentYearDate),
    });

    monthsOfYear.forEach(monthDate => {
      const monthKey = format(monthDate, 'LLLL', { locale: ru }) + ' ' + format(monthDate, 'yyyy', { locale: ru });
      groups[monthKey] = campaignsForSelectedYear.filter(campaign => 
        isSameMonth(new Date(campaign.flight_period.start_date), monthDate)
      ).sort((a, b) => new Date(a.flight_period.start_date).getTime() - new Date(b.flight_period.start_date).getTime());
    });

    return groups;
  }, [campaignsForSelectedYear, selectedYear]);

  const sortedMonths = useMemo(() => Object.keys(groupedCampaigns).sort((a, b) => {
    const dateA = new Date(a.replace(/ (\d{4})/, ' 1,$1')).getTime();
    const dateB = new Date(b.replace(/ (\d{4})/, ' 1,$1')).getTime();
    return dateA - dateB;
  }), [groupedCampaigns]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    if (onCampaignUpdated) {
      onCampaignUpdated(updatedCampaign);
    }
    setSelectedCampaign(updatedCampaign);
  };

  return (
    <div className="relative pl-8">
      {/* Переключатель годов */}
      <div className="mb-8 flex items-center gap-4">
        <h3 className="text-xl font-bold text-white">Год:</h3>
        <select
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
        >
          <option value="all">Все года</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Вертикальная линия таймлайна */}
      <div className="absolute left-[13px] top-0 h-full w-0.5 bg-gray-700"></div>

      {sortedMonths.map((monthYear) => (
        <div key={monthYear} className="mb-12 last:mb-0">
          {/* Точка и название месяца */}
          <div className="relative mb-6">
            <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 border-4 border-gray-900 z-10"></div>
            <h2 className="text-2xl font-bold text-white ml-8">{monthYear}</h2>
          </div>

          {/* Карточки кампаний для месяца */}
          <div className="space-y-6 ml-8">
            {groupedCampaigns[monthYear] && groupedCampaigns[monthYear].length > 0 ? (
              groupedCampaigns[monthYear].map((campaign) => (
                <div
                  key={`${campaign.campaign_name}-${campaign.flight_period.start_date}-${campaign.flight_period.end_date}`} 
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={getVerticalColorClass(campaign.campaign_vertical)}
                      >
                        {campaign.campaign_vertical}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium border border-white text-white bg-transparent">
                        {campaign.campaign_type}
                      </span>
                    </div>
                    <span className="text-lg font-medium text-white">{campaign.campaign_name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    с {format(new Date(campaign.flight_period.start_date), 'dd.MM.yyyy')} по {format(new Date(campaign.flight_period.end_date), 'dd.MM.yyyy')}
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-gray-500 italic">
                Нет кампаний в этом месяце.
              </div>
            )}
          </div>
        </div>
      ))}

      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          isAdmin={isAdmin}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
} 