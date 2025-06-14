'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Campaign } from '@/lib/types';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format, isPast, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Analytics() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      console.log('Fetching campaigns for Analytics page from Supabase...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns for Analytics page:', error);
      } else {
        console.log('Successfully fetched campaigns for Analytics page:', data);
        setCampaigns(data as Campaign[]);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [supabase]);

  const {
    totalCampaigns,
    activeCampaignsCount,
    completedCampaignsCount,
    campaignsByVertical,
    campaignsByType,
    campaignsByMonth,
  } = useMemo(() => {
    const now = new Date();

    const active = campaigns.filter((campaign) =>
      isWithinInterval(now, {
        start: new Date(campaign.flight_period.start_date),
        end: new Date(campaign.flight_period.end_date),
      })
    ).length;

    const completed = campaigns.filter(
      (campaign) =>
        isPast(new Date(campaign.flight_period.end_date)) &&
        !isWithinInterval(now, {
          start: new Date(campaign.flight_period.start_date),
          end: new Date(campaign.flight_period.end_date),
        })
    ).length;

    // Распределение по вертикалям
    const verticalCounts: { [key: string]: number } = {};
    campaigns.forEach((c) => {
      verticalCounts[c.campaign_vertical] =
        (verticalCounts[c.campaign_vertical] || 0) + 1;
    });
    const verticalLabels = Object.keys(verticalCounts);
    const verticalBackgroundColors = verticalLabels.map(
      (label) => getVerticalColorClass(label).backgroundColor
    );
    const verticalBorderColors = verticalLabels.map(
      (label) => getVerticalColorClass(label).backgroundColor
    );

    const campaignsByVerticalData = {
      labels: verticalLabels,
      datasets: [
        {
          label: 'Количество кампаний',
          data: Object.values(verticalCounts),
          backgroundColor: verticalBackgroundColors,
          borderColor: verticalBorderColors,
          borderWidth: 1,
        },
      ],
    };

    // Распределение по типам
    const typeCounts: { [key: string]: number } = {};
    campaigns.forEach((c) => {
      typeCounts[c.campaign_type] = (typeCounts[c.campaign_type] || 0) + 1;
    });
    const campaignsByTypeData = {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: 'Количество кампаний',
          data: Object.values(typeCounts),
          backgroundColor: [
            '#F59E0B', // amber-500
            '#10B981', // emerald-500
            '#6366F1', // indigo-500
            '#EC4899', // pink-500
            '#3B82F6', // blue-600
          ],
          borderColor: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6'],
          borderWidth: 1,
        },
      ],
    };

    // Кампании по месяцам запуска
    const monthCounts: { [key: string]: number } = {};
    campaigns.forEach((c) => {
      const monthYear = format(
        new Date(c.flight_period.start_date),
        'MMMM yyyy',
        { locale: ru }
      );
      monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
    });
    // Сортируем месяцы
    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
      const dateA = new Date(a.replace(/ (\d{4})/, ', $1'));
      const dateB = new Date(b.replace(/ (\d{4})/, ', $1'));
      return dateA.getTime() - dateB.getTime();
    });
    const campaignsByMonthData = {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Количество кампаний',
          data: sortedMonths.map((month) => monthCounts[month]),
          backgroundColor: '#60A5FA', // blue-400
          borderColor: '#3B82F6',
          borderWidth: 1,
        },
      ],
    };

    return {
      totalCampaigns: campaigns.length,
      activeCampaignsCount: active,
      completedCampaignsCount: completed,
      campaignsByVertical: campaignsByVerticalData,
      campaignsByType: campaignsByTypeData,
      campaignsByMonth: campaignsByMonthData,
    };
  }, [campaigns]);

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#ffffff', // Белый цвет текста легенды
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label?: string; parsed?: number }) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed;
            }
            return label;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff', // Белый цвет текста легенды
        },
      },
      title: {
        display: false,
        text: 'Количество кампаний по месяцам запуска',
        color: '#ffffff',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff', // Белый цвет текста на оси X
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Цвет сетки X
        },
      },
      y: {
        ticks: {
          color: '#ffffff', // Белый цвет текста на оси Y
          stepSize: 1, // Шаг в 1 для количества кампаний
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Цвет сетки Y
        },
      },
    },
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center text-white text-xl">
        <LoadingSpinner />
        <p className="mt-4">Загрузка аналитики кампаний...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Аналитика кампаний</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-blue-400">{totalCampaigns}</p>
          <p className="text-gray-300 mt-2">Всего кампаний</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-green-400">
            {activeCampaignsCount}
          </p>
          <p className="text-gray-300 mt-2">Активных кампаний</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-red-400">
            {completedCampaignsCount}
          </p>
          <p className="text-gray-300 mt-2">Завершенных кампаний</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 md:col-span-2 shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Кампании по вертикалям
          </h2>
          <div className="h-80">
            <Doughnut data={campaignsByVertical} options={donutOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Кампании по типу
          </h2>
          <div className="h-80">
            <Doughnut data={campaignsByType} options={donutOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 md:col-span-3 shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Кампании по месяцам запуска
          </h2>
          <div className="h-96">
            <Bar data={campaignsByMonth} options={barOptions} />
          </div>
        </div>
      </div>
    </main>
  );
}
