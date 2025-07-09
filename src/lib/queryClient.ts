import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Кэшировать данные на 5 минут
      staleTime: 5 * 60 * 1000,
      // Сохранять в кэше неактивные данные на 10 минут
      gcTime: 10 * 60 * 1000,
      // Повторять запросы при ошибках
      retry: (failureCount, error: unknown) => {
        // Не повторять при 4xx ошибках (клиентские ошибки)
        const errorWithStatus = error as { status?: number };
        if (
          errorWithStatus?.status &&
          errorWithStatus.status >= 400 &&
          errorWithStatus.status < 500
        ) {
          return false;
        }
        // Максимум 3 попытки для других ошибок
        return failureCount < 3;
      },
      // Повторная загрузка при фокусе окна
      refetchOnWindowFocus: false,
      // Повторная загрузка при восстановлении соединения
      refetchOnReconnect: true,
    },
    mutations: {
      // Повторять мутации при ошибках сети
      retry: (failureCount, error: unknown) => {
        // Не повторять при 4xx ошибках
        const errorWithStatus = error as { status?: number };
        if (
          errorWithStatus?.status &&
          errorWithStatus.status >= 400 &&
          errorWithStatus.status < 500
        ) {
          return false;
        }
        // Максимум 2 попытки для мутаций
        return failureCount < 2;
      },
    },
  },
});

// Ключи для запросов
export const queryKeys = {
  campaigns: {
    all: ['campaigns'] as const,
    lists: () => [...queryKeys.campaigns.all, 'list'] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (filters: Record<string, any>) =>
      [...queryKeys.campaigns.lists(), { filters }] as const,
    details: () => [...queryKeys.campaigns.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.campaigns.details(), id] as const,
  },
  verticals: {
    all: ['verticals'] as const,
    lists: () => [...queryKeys.verticals.all, 'list'] as const,
  },
  userRoles: {
    all: ['userRoles'] as const,
    current: () => [...queryKeys.userRoles.all, 'current'] as const,
  },
  reactions: {
    all: ['reactions'] as const,
    byCampaign: (campaignId: string) =>
      [...queryKeys.reactions.all, 'campaign', campaignId] as const,
    summary: () => [...queryKeys.reactions.all, 'summary'] as const,
  },
} as const;
