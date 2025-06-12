import { Campaign } from '@/lib/types';

export const campaigns: Campaign[] = [
  {
    id: '1',
    campaign_type: "T2",
    campaign_vertical: "Товары",
    campaign_name: "Ведите бизнес по своим правилам",
    vertical: "Товары",
    status: "active",
    budget: 1000000,
    metrics: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0
    },
    flight_period: {
      start_date: "2024-03-01",
      end_date: "2024-03-31"
    },
    geo: "Россия",
    audience: "Предприниматели",
    objectives: ["Увеличение продаж", "Повышение узнаваемости"],
    key_message: "Ведите бизнес по своим правилам с Avito",
    channels: ["ВКонтакте", "Яндекс.Директ"],
    materials: ["Баннеры", "Видео"],
    links: [
      {
        label: "Лендинг",
        url: "https://example.com/campaign1"
      }
    ],
    attachments: [
      {
        label: "Презентация",
        url: "https://example.com/attachment1.pdf"
      }
    ]
  },
  {
    id: '2',
    campaign_type: "T1",
    campaign_vertical: "Недвижимость",
    campaign_name: "Найдите свой идеальный дом",
    vertical: "Недвижимость",
    status: "active",
    budget: 1500000,
    metrics: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0
    },
    flight_period: {
      start_date: "2024-03-15",
      end_date: "2024-04-15"
    },
    geo: "Москва и Санкт-Петербург",
    audience: "Потенциальные покупатели недвижимости",
    objectives: ["Увеличение количества объявлений", "Повышение конверсии"],
    key_message: "Найдите свой идеальный дом на Avito",
    channels: ["Google Ads", "Facebook"],
    materials: ["Баннеры", "Видео", "Аудио"],
    links: [
      {
        label: "Лендинг",
        url: "https://example.com/campaign2"
      }
    ],
    attachments: [
      {
        label: "Презентация",
        url: "https://example.com/attachment2.pdf"
      }
    ]
  },
  // ... остальные кампании
]; 