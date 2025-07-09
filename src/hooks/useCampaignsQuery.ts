import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '@/lib/api/campaignsService';
import { queryKeys } from '@/lib/queryClient';
import { Campaign, CampaignInsert, CampaignUpdate } from '@/types/campaign';
import { useNotification } from './useNotification';

// Хук для получения всех кампаний
export function useCampaigns() {
  return useQuery({
    queryKey: queryKeys.campaigns.lists(),
    queryFn: campaignsService.getAll,
    staleTime: 5 * 60 * 1000, // Возвращаем нормальное кэширование - 5 минут
  });
}

// Хук для получения кампании по ID
export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => campaignsService.getById(id),
    enabled: !!id, // Запрос выполняется только если есть ID
  });
}

// Хук для получения кампаний по вертикали
export function useCampaignsByVertical(vertical: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.list({ vertical }),
    queryFn: () => campaignsService.getByVertical(vertical),
    enabled: !!vertical && vertical !== 'all',
  });
}

// Хук для получения доступных вертикалей
export function useVerticals() {
  return useQuery({
    queryKey: queryKeys.verticals.lists(),
    queryFn: campaignsService.getVerticals,
    staleTime: 10 * 60 * 1000, // 10 минут, так как вертикали меняются редко
  });
}

// Хук для создания кампании
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: (campaign: CampaignInsert) => campaignsService.create(campaign),
    onSuccess: () => {
      // Инвалидируем кэш списков кампаний
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
      // Инвалидируем кэш вертикалей (может добавиться новая)
      queryClient.invalidateQueries({ queryKey: queryKeys.verticals.lists() });

      showSuccess('Кампания успешно создана!');
    },
    onError: (error: Error) => {
      showError(`Ошибка при создании кампании: ${error.message}`);
    },
  });
}

// Хук для обновления кампании
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CampaignUpdate }) =>
      campaignsService.update(id, updates),
    onSuccess: (updatedCampaign) => {
      // Обновляем кэш конкретной кампании
      queryClient.setQueryData(
        queryKeys.campaigns.detail(updatedCampaign.id),
        updatedCampaign
      );

      // Инвалидируем кэш списков кампаний
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });

      showSuccess('Кампания успешно обновлена!');
    },
    onError: (error: Error) => {
      showError(`Ошибка при обновлении кампании: ${error.message}`);
    },
  });
}

// Хук для удаления кампании
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: (_, deletedId) => {
      // Удаляем из кэша конкретную кампанию
      queryClient.removeQueries({
        queryKey: queryKeys.campaigns.detail(deletedId),
      });

      // Инвалидируем кэш списков кампаний
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });

      showSuccess('Кампания успешно удалена!');
    },
    onError: (error: Error) => {
      showError(`Ошибка при удалении кампании: ${error.message}`);
    },
  });
}

// Хук для оптимистичного обновления кампании (для быстрого UI)
export function useOptimisticUpdateCampaign() {
  const queryClient = useQueryClient();
  const { showError } = useNotification();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CampaignUpdate }) =>
      campaignsService.update(id, updates),

    // Оптимистичное обновление
    onMutate: async ({ id, updates }) => {
      // Отменяем исходящие запросы для этой кампании
      await queryClient.cancelQueries({
        queryKey: queryKeys.campaigns.detail(id),
      });

      // Сохраняем предыдущее значение
      const previousCampaign = queryClient.getQueryData(
        queryKeys.campaigns.detail(id)
      );

      // Оптимистично обновляем кэш
      queryClient.setQueryData(
        queryKeys.campaigns.detail(id),
        (old: Campaign | undefined) => {
          if (!old) return old;
          return { ...old, ...updates };
        }
      );

      // Возвращаем контекст с предыдущим значением
      return { previousCampaign, id };
    },

    // Если мутация не удалась, откатываем изменения
    onError: (error: Error, _, context) => {
      if (context?.previousCampaign) {
        queryClient.setQueryData(
          queryKeys.campaigns.detail(context.id),
          context.previousCampaign
        );
      }
      showError(`Ошибка при обновлении кампании: ${error.message}`);
    },

    // Всегда инвалидируем кэш после завершения
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaigns.detail(id),
      });
    },
  });
}
