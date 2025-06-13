'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import {
  format,
  getYear,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  isSameMonth,
  isSameYear,
} from 'date-fns';
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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: true });

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        setCampaigns(data as Campaign[]);
      }
    };

    fetchCampaigns();
  }, [supabase]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
    setSelectedCampaign(null);
  };

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        campaigns.map((c) => getYear(new Date(c.flight_period.start_date)))
      )
    ).sort((a, b) => b - a);
    return years;
  }, [campaigns]);

  const months = useMemo(() => {
    if (selectedYear === 'all') {
      const allMonths = eachMonthOfInterval({
        start: new Date(
          Math.min(
            ...campaigns.map((c) =>
              new Date(c.flight_period.start_date).getFullYear()
            )
          ) || new Date().getFullYear(),
          0,
          1
        ),
        end: new Date(
          Math.max(
            ...campaigns.map((c) =>
              new Date(c.flight_period.end_date).getFullYear()
            )
          ) || new Date().getFullYear(),
          11,
          31
        ),
      });
      return allMonths
        .filter(
          (month, index, self) =>
            index ===
            self.findIndex(
              (m) => format(m, 'yyyy-MM') === format(month, 'yyyy-MM')
            )
        )
        .sort((a, b) => a.getTime() - b.getTime());
    }
    return eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0)),
      end: endOfYear(new Date(selectedYear, 0)),
    });
  }, [selectedYear, campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const campaignStartDate = new Date(campaign.flight_period.start_date);
      const campaignEndDate = new Date(campaign.flight_period.end_date);

      if (selectedYear === 'all') {
        return true;
      }

      return (
        isSameYear(campaignStartDate, new Date(selectedYear, 0)) ||
        isSameYear(campaignEndDate, new Date(selectedYear, 0))
      );
    });
  }, [campaigns, selectedYear]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <select
          value={selectedYear}
          onChange={(e) =>
            setSelectedYear(
              e.target.value === 'all' ? 'all' : parseInt(e.target.value)
            )
          }
          className="p-2 border rounded bg-gray-700 text-white"
        >
          <option value="all">Все годы</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {months.map((month) => {
          const monthCampaigns = filteredCampaigns.filter((campaign) => {
            const campaignStartDate = new Date(
              campaign.flight_period.start_date
            );
            return (
              isSameMonth(campaignStartDate, month)
            );
          });

          return (
            <div
              key={month.toISOString()}
              className="p-4 bg-gray-800 rounded-lg shadow-lg"
            >
              <h3 className="font-bold mb-4 text-white">
                {format(month, 'LLLL', { locale: ru })}
              </h3>
              {monthCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className="p-3 mb-1 rounded cursor-pointer bg-gray-800 hover:bg-gray-700 shadow-md transition-all duration-200 ease-in-out"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-white">
                      {campaign.campaign_name}
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={getVerticalColorClass(campaign.campaign_vertical)}
                    >
                      {campaign.campaign_vertical}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {format(
                      new Date(campaign.flight_period.start_date),
                      'd MMM',
                      { locale: ru }
                    )}{' '}
                    -{' '}
                    {format(
                      new Date(campaign.flight_period.end_date),
                      'd MMM',
                      { locale: ru }
                    )}
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
