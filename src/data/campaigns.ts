import { Campaign } from '@/lib/types';

export const campaigns: Campaign[] = [
  {
    campaign_type: "T2",
    campaign_vertical: "Товары",
    campaign_name: "Ведите бизнес по своим правилам",
    flight_period: {
      start_date: "2024-10-14",
      end_date: "2024-11-15"
    },
    geo: "РФ",
    audience: "Про селлеры, 25-45, опытные онлайн-коммерсанты, работающие через маркетплейсы и компании-ритейлеры, владельцы интернет-магазинов, владельцы оффлайн-точек, которые являются новичками в онлайн продажах.",
    objectives: [
      "Рассказать профессиональным продавцам о том, что Авито — эффективная площадка для продаж",
      "Привлечь новых pro продавцов"
    ],
    key_message: "ведите бизнес/продавайте по своим правилам",
    channels: ["OLV", "Banners", "DOOH", "медиафасад", "радио"],
    materials: ["OLV", "Banners", "DOOH", "медиафасад", "радио"],
    links: [
      {
        label: "Карточка проекта",
        url: "https://docs.google.com/document/d/1ZcroPwdEabkKH50ZhxU3wSy9u6VMIFmz/edit"
      }
    ],
    attachments: [
      {
        label: "Avito_20sec_planD_HD_TV_221124.mp4",
        url: "https://drive.google.com/file/d/1BkNhlv5jjhgFLG0Swdh9csIhAbdayulU/view?usp=drive_link"
      },
      {
        label: "Banners",
        url: "https://drive.google.com/drive/folders/15pJacsMDbyakV8lc6pmb3_YZnr-hOfpk?usp=drive_link"
      },
      {
        label: "DOOH",
        url: "https://drive.google.com/file/d/12afkNPa0MLeXdWzjTbs2pD1pAlkCCxJE/view?usp=drive_link"
      },
      {
        label: "медиафасад",
        url: "https://drive.google.com/file/d/1saPGdRYNZROoApEF6Qo_3exnxnpRNZ_G/view?usp=drive_link"
      },
      {
        label: "радио",
        url: "https://drive.google.com/drive/folders/1Je-MH3qIaSo1D18I9q-BsMlWyA4vD17v?usp=drive_link"
      }
    ]
  },
  // ... остальные кампании
]; 