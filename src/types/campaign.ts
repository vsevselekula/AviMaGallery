import { Database } from '@/lib/database.types';

// Базовые типы из автоматически сгенерированной схемы
type BaseCampaign = Database['public']['Tables']['campaigns']['Row'];
type BaseCampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
type BaseCampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

// Конкретные типы для JSON-полей
export interface FlightPeriod {
  start_date: string;
  end_date: string;
}

export interface CampaignLink {
  label: string;
  url: string;
}

// Переопределяем типы с конкретными JSON-структурами
export interface Campaign
  extends Omit<BaseCampaign, 'flight_period' | 'links'> {
  flight_period: FlightPeriod | null;
  links: CampaignLink[] | null;
}

export interface CampaignInsert
  extends Omit<BaseCampaignInsert, 'flight_period' | 'links'> {
  flight_period?: FlightPeriod | null;
  links?: CampaignLink[] | null;
}

export interface CampaignUpdate
  extends Omit<BaseCampaignUpdate, 'flight_period' | 'links'> {
  flight_period?: FlightPeriod | null;
  links?: CampaignLink[] | null;
}
