import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Campaign, CampaignInsert, CampaignUpdate } from '@/types/campaign';

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCampaign: (campaign: CampaignInsert) => Promise<Campaign | null>;
  updateCampaign: (id: string, updates: CampaignUpdate) => Promise<boolean>;
  deleteCampaign: (id: string) => Promise<boolean>;
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // Загрузка кампаний
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCampaigns(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка загрузки кампаний';
      setError(errorMessage);
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Создание новой кампании
  const createCampaign = useCallback(
    async (campaignData: CampaignInsert): Promise<Campaign | null> => {
      try {
        setError(null);

        // Автоматически определяем статус по датам
        const getStatusFromDates = (startDate: string, endDate: string) => {
          const now = new Date();
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (now < start) return 'planned';
          if (now > end) return 'completed';
          return 'active';
        };

        const flightPeriod = campaignData.flight_period as {
          start_date: string;
          end_date: string;
        } | null;

        const status = flightPeriod
          ? getStatusFromDates(flightPeriod.start_date, flightPeriod.end_date)
          : 'planned';

        const { data, error: createError } = await supabase
          .from('campaigns')
          .insert([{ ...campaignData, status }])
          .select()
          .single();

        if (createError) {
          throw new Error(createError.message);
        }

        // Обновляем локальное состояние
        setCampaigns((prev) => [data, ...prev]);

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка создания кампании';
        setError(errorMessage);
        console.error('Error creating campaign:', err);
        return null;
      }
    },
    [supabase]
  );

  // Обновление кампании
  const updateCampaign = useCallback(
    async (id: string, updates: CampaignUpdate): Promise<boolean> => {
      try {
        setError(null);

        const { data, error: updateError } = await supabase
          .from('campaigns')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Обновляем локальное состояние
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === id ? { ...campaign, ...data } : campaign
          )
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка обновления кампании';
        setError(errorMessage);
        console.error('Error updating campaign:', err);
        return false;
      }
    },
    [supabase]
  );

  // Удаление кампании
  const deleteCampaign = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);

        const { error: deleteError } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // Обновляем локальное состояние
        setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка удаления кампании';
        setError(errorMessage);
        console.error('Error deleting campaign:', err);
        return false;
      }
    },
    [supabase]
  );

  // Загружаем кампании при монтировании
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
