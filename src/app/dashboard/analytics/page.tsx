'use client';

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { CampaignFormModal } from '@/components/features/campaign/CampaignFormModal';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function AnalyticsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVertical, setSelectedVertical] = useState<string>('all');
  const [selectedVerticalForChannels, setSelectedVerticalForChannels] =
    useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedChannelCampaigns, setSelectedChannelCampaigns] = useState<
    Campaign[]
  >([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chartRef = useRef(null);

  const campaignId = searchParams.get('campaign');

  // Функция для обработки клика по столбцу канала
  const handleChannelClick = useCallback(
    (channelName: string) => {
      const filteredCampaigns =
        selectedVerticalForChannels === 'all'
          ? campaigns
          : campaigns.filter(
              (c) => c.campaign_vertical === selectedVerticalForChannels
            );

      const campaignsWithChannel = filteredCampaigns.filter(
        (campaign) =>
          campaign.channels && campaign.channels.includes(channelName)
      );

      setSelectedChannel(channelName);
      setSelectedChannelCampaigns(campaignsWithChannel);
    },
    [campaigns, selectedVerticalForChannels]
  );

  // Функция для закрытия детального просмотра
  const handleCloseChannelDetails = useCallback(() => {
    setSelectedChannel(null);
    setSelectedChannelCampaigns([]);
  }, []);

  // Функция для открытия кампании
  const handleOpenCampaign = (campaign: Campaign) => {
    // Добавляем параметр campaign к текущему URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('campaign', campaign.id);
    router.push(currentUrl.pathname + currentUrl.search);
  };

  // Обработка параметра campaign из URL
  useEffect(() => {
    if (!campaignId) {
      setSelectedCampaign(null);
      return;
    }

    // Ищем кампанию в уже загруженных
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    } else if (campaigns.length > 0) {
      // Если кампания не найдена, убираем параметр из URL
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('campaign');
      router.replace(currentUrl.pathname + currentUrl.search);
    }
  }, [campaignId, campaigns, router]);

  const handleCampaignModalClose = () => {
    setSelectedCampaign(null);
    // Убираем параметр campaign из URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('campaign');
    router.replace(currentUrl.pathname + currentUrl.search);
  };

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    // Обновляем кампанию в списке
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
    setSelectedCampaign(updatedCampaign);
  };

  // Сбрасываем выбранный канал при изменении фильтра вертикали
  useEffect(() => {
    if (selectedChannel) {
      handleCloseChannelDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVerticalForChannels, handleCloseChannelDetails]); // ВАЖНО: НЕ включаем selectedChannel в зависимости!

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('campaigns_v2')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns for Analytics page:', error);
      } else {
        setCampaigns(data as Campaign[]);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [supabase]);

  // Убираем selectedChannel из зависимостей

  const {
    totalCampaigns,
    activeCampaignsCount,
    completedCampaignsCount,
    campaignsByVertical,
    campaignsByType,
    campaignsByMonth,
    channelsPopularity,
    availableVerticals,
  } = useMemo(() => {
    const now = new Date();

    // Получаем список всех доступных вертикалей
    const availableVerticals = Array.from(
      new Set(campaigns.map((c) => c.campaign_vertical))
    ).sort();

    // Фильтруем кампании по выбранной вертикали для графика по месяцам
    const filteredCampaignsForTimeline =
      selectedVertical === 'all'
        ? campaigns
        : campaigns.filter((c) => c.campaign_vertical === selectedVertical);

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

    // Кампании по месяцам запуска (с учетом фильтра по вертикали)
    const monthCounts: { [key: string]: number } = {};

    // Находим диапазон дат для всех кампаний (не только отфильтрованных)
    const allDates = campaigns.map((c) => new Date(c.flight_period.start_date));
    const minDate =
      allDates.length > 0
        ? new Date(Math.min(...allDates.map((d) => d.getTime())))
        : new Date();
    const maxDate =
      allDates.length > 0
        ? new Date(Math.max(...allDates.map((d) => d.getTime())))
        : new Date();

    // Создаем полный список месяцев от минимальной до максимальной даты
    const allMonths: { monthYear: string; date: Date }[] = [];
    const currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    while (currentDate <= endDate) {
      const monthYear = format(currentDate, 'LLLL yyyy', { locale: ru });
      allMonths.push({
        monthYear,
        date: new Date(currentDate),
      });
      monthCounts[monthYear] = 0; // Инициализируем нулем
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Заполняем реальными данными
    filteredCampaignsForTimeline.forEach((c) => {
      const startDate = new Date(c.flight_period.start_date);
      const monthYear = format(startDate, 'LLLL yyyy', { locale: ru });
      monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
    });

    // Сортируем месяцы по датам
    const sortedMonths = allMonths
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((m) => m.monthYear);

    // Определяем цвет графика в зависимости от выбранной вертикали
    const getChartColor = () => {
      if (selectedVertical === 'all') {
        return { backgroundColor: '#60A5FA', borderColor: '#3B82F6' }; // blue
      }
      const verticalColor = getVerticalColorClass(selectedVertical);
      return {
        backgroundColor: verticalColor.backgroundColor,
        borderColor: verticalColor.backgroundColor,
      };
    };

    const chartColors = getChartColor();

    const campaignsByMonthData = {
      labels: sortedMonths,
      datasets: [
        {
          label:
            selectedVertical === 'all'
              ? 'Количество кампаний'
              : `Кампании: ${selectedVertical}`,
          data: sortedMonths.map((month) => monthCounts[month]),
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.borderColor,
          borderWidth: 1,
        },
      ],
    };

    // Популярность каналов (с учетом фильтра по вертикали)
    const filteredCampaignsForChannels =
      selectedVerticalForChannels === 'all'
        ? campaigns
        : campaigns.filter(
            (c) => c.campaign_vertical === selectedVerticalForChannels
          );

    const channelCounts: { [key: string]: number } = {};
    filteredCampaignsForChannels.forEach((c) => {
      (c.channels ?? []).forEach((ch) => {
        channelCounts[ch] = (channelCounts[ch] || 0) + 1;
      });
    });
    const sortedChannels = Object.keys(channelCounts).sort(
      (a, b) => channelCounts[b] - channelCounts[a]
    );

    // Определяем цвет графика каналов в зависимости от выбранной вертикали
    const getChannelsChartColor = () => {
      if (selectedVerticalForChannels === 'all') {
        return { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }; // amber
      }
      const verticalColor = getVerticalColorClass(selectedVerticalForChannels);
      return {
        backgroundColor: verticalColor.backgroundColor,
        borderColor: verticalColor.backgroundColor,
      };
    };

    const channelsChartColors = getChannelsChartColor();

    const channelsPopularity = {
      labels: sortedChannels,
      datasets: [
        {
          label:
            selectedVerticalForChannels === 'all'
              ? 'Частота использования'
              : `Частота использования: ${selectedVerticalForChannels}`,
          data: sortedChannels.map((ch) => channelCounts[ch]),
          backgroundColor: channelsChartColors.backgroundColor,
          borderColor: channelsChartColors.borderColor,
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
      channelsPopularity,
      availableVerticals,
    };
  }, [campaigns, selectedVertical, selectedVerticalForChannels]);

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
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

  // Настройки для графика каналов с обработчиком клика
  const channelsBarOptions = {
    ...barOptions,
    onClick: (event: unknown, elements: Array<{ index: number }>) => {
      if (elements && elements.length > 0) {
        const elementIndex = elements[0].index;
        const channelName = channelsPopularity.labels[elementIndex] as string;

        handleChannelClick(channelName);
      }
    },
    plugins: {
      ...barOptions.plugins,
      tooltip: {
        callbacks: {
          afterLabel: () => {
            return 'Нажмите для просмотра кампаний';
          },
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Кампании по вертикалям
          </h2>
          <div className="h-80">
            <Doughnut data={campaignsByVertical} options={donutOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Кампании по типу
          </h2>
          <div className="h-80">
            <Doughnut data={campaignsByType} options={donutOptions} />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">
            Кампании по месяцам запуска
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Вертикаль:</label>
            <select
              value={selectedVertical}
              onChange={(e) => setSelectedVertical(e.target.value)}
              className="px-3 py-1 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Все вертикали</option>
              {availableVerticals.map((vertical) => (
                <option key={vertical} value={vertical}>
                  {vertical}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-96">
          <Bar data={campaignsByMonth} options={barOptions} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-md mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">
            Популярность каналов
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Вертикаль:</label>
            <select
              value={selectedVerticalForChannels}
              onChange={(e) => setSelectedVerticalForChannels(e.target.value)}
              className="px-3 py-1 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Все вертикали</option>
              {availableVerticals.map((vertical) => (
                <option key={vertical} value={vertical}>
                  {vertical}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-96">
          <Bar
            ref={chartRef}
            data={channelsPopularity}
            options={channelsBarOptions}
          />
        </div>

        {/* Подсказка для пользователя */}
        <div className="mt-2 text-sm text-gray-400 text-center">
          💡 Нажмите на столбец канала, чтобы увидеть список кампаний
        </div>
      </div>

      {/* Детальный просмотр кампаний выбранного канала */}
      {selectedChannel && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-md mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Кампании с каналом "{selectedChannel}"
              {selectedVerticalForChannels !== 'all' && (
                <span className="text-gray-400 ml-2">
                  (вертикаль: {selectedVerticalForChannels})
                </span>
              )}
            </h2>
            <button
              onClick={handleCloseChannelDetails}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 text-gray-300">
            Найдено кампаний:{' '}
            <span className="font-semibold text-white">
              {selectedChannelCampaigns.length}
            </span>
            <span className="ml-4 text-sm text-gray-400">
              💡 Нажмите на строку для просмотра деталей кампании
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Название кампании
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Вертикаль
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Тип
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Период
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Все каналы
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedChannelCampaigns.map((campaign) => {
                  const verticalColor = getVerticalColorClass(
                    campaign.campaign_vertical
                  );
                  const startDate = campaign.flight_period?.start_date
                    ? format(
                        new Date(campaign.flight_period.start_date),
                        'dd.MM.yyyy',
                        { locale: ru }
                      )
                    : 'Не указано';
                  const endDate = campaign.flight_period?.end_date
                    ? format(
                        new Date(campaign.flight_period.end_date),
                        'dd.MM.yyyy',
                        { locale: ru }
                      )
                    : 'Не указано';

                  return (
                    <tr
                      key={campaign.id}
                      className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleOpenCampaign(campaign)}
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {campaign.campaign_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: verticalColor.backgroundColor,
                          }}
                        ></span>
                        {campaign.campaign_vertical}
                      </td>
                      <td className="px-6 py-4">{campaign.campaign_type}</td>
                      <td className="px-6 py-4">
                        {startDate} - {endDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(campaign.channels || []).map((channel, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                channel === selectedChannel
                                  ? 'bg-blue-900 text-blue-300 font-semibold'
                                  : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {channel}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedChannelCampaigns.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Кампании с каналом "{selectedChannel}" не найдены
            </div>
          )}
        </div>
      )}

      {/* Модальное окно детального просмотра кампании */}
      {selectedCampaign && (
        <CampaignFormModal
          campaign={selectedCampaign}
          onClose={handleCampaignModalClose}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </main>
  );
}

export default function Analytics() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen w-full">
          <LoadingSpinner />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
