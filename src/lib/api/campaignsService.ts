import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Campaign, CampaignInsert, CampaignUpdate } from '@/types/campaign';
import { Database } from '@/lib/database.types';

const supabase = createClientComponentClient<Database>();

export const campaignsService = {
  // Получение всех кампаний
  async getAll(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns_v2')
      .select('*')
      .order('flight_period->start_date', { ascending: false }); // Сортируем по дате начала кампании (самые свежие первыми)

    if (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return data as Campaign[];
  },

  // Получение кампании по ID
  async getById(id: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns_v2')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }

    return data as Campaign;
  },

  // Получение кампаний по вертикали
  async getByVertical(vertical: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns_v2')
      .select('*')
      .eq('campaign_vertical', vertical)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch campaigns by vertical: ${error.message}`
      );
    }

    return data as Campaign[];
  },

  // Создание новой кампании
  async create(campaign: CampaignInsert): Promise<Campaign> {
    // Убираем поля, которые должны быть сгенерированы базой данных
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...insertData } =
      campaign as CampaignInsert & {
        id?: string;
        created_at?: string;
        updated_at?: string;
      };

    const { data, error } = await supabase
      .from('campaigns_v2')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    return data as Campaign;
  },

  // Обновление кампании
  async update(id: string, updates: CampaignUpdate): Promise<Campaign> {
    // Убираем поля, которые не должны обновляться вручную
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, updated_at, ...updateData } =
      updates as CampaignUpdate & {
        created_at?: string;
        updated_at?: string;
      };

    const { data, error } = await supabase
      .from('campaigns_v2')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    return data as Campaign;
  },

  // Удаление кампании
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('campaigns_v2').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  },

  // Получение доступных вертикалей
  async getVerticals(): Promise<string[]> {
    const { data, error } = await supabase
      .from('campaigns_v2')
      .select('campaign_vertical')
      .not('campaign_vertical', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch verticals: ${error.message}`);
    }

    const uniqueVerticals = Array.from(
      new Set(data?.map((item) => item.campaign_vertical).filter(Boolean))
    );

    return uniqueVerticals;
  },
};
