'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import { format, getYear, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth, isSameYear } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { useMemo } from 'react';
import { CampaignModal } from './CampaignModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function CampaignCalendar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    const currentYear = new Date().getFullYear();
    return currentYear;
  });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        setCampaigns(data as Campaign[]);
      }
    };

    fetchCampaigns();
  }, [supabase]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
    setSelectedCampaign(null);
  };

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(campaigns.map(c => getYear(new Date(c.flight_period.start_date))))).sort((a, b) => b - a);
    return years;
  }, [campaigns]);

  const months = useMemo(() => {
    if (selectedYear === 'all') {
      return eachMonthOfInterval({
        start: startOfYear(new Date()),
        end: endOfYear(new Date())
      });
    }
    return eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0)),
      end: endOfYear(new Date(selectedYear, 0))
    });
  }, [selectedYear]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const campaignStartDate = new Date(campaign.flight_period.start_date);
      const campaignEndDate = new Date(campaign.flight_period.end_date);
      
      if (selectedYear === 'all') {
        return true;
      }
      
      return isSameYear(campaignStartDate, new Date(selectedYear, 0)) ||
             isSameYear(campaignEndDate, new Date(selectedYear, 0));
    });
  }, [campaigns, selectedYear]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="all">Все годы</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map(month => {
          const monthCampaigns = filteredCampaigns.filter(campaign => {
            const campaignStartDate = new Date(campaign.flight_period.start_date);
            const campaignEndDate = new Date(campaign.flight_period.end_date);
            return isSameMonth(campaignStartDate, month) || isSameMonth(campaignEndDate, month);
          });

          return (
            <div key={month.toISOString()} className="border rounded p-4">
              <h3 className="font-bold mb-2">
                {format(month, 'LLLL', { locale: ru })}
              </h3>
              {monthCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`p-2 mb-2 rounded cursor-pointer ${getVerticalColorClass(campaign.campaign_vertical)}`}
                >
                  <div className="font-medium">{campaign.campaign_name}</div>
                  <div className="text-sm">
                    {format(new Date(campaign.flight_period.start_date), 'd MMM', { locale: ru })} - {format(new Date(campaign.flight_period.end_date), 'd MMM', { locale: ru })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
} 