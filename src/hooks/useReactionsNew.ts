import { useEffect } from 'react';
import { useReactionsContext } from '@/contexts/ReactionsContext';

/**
 * Упрощенный хук для работы с реакциями через глобальный контекст
 * @param campaignIds - Массив ID кампаний для отслеживания
 */
export function useReactions(campaignIds: string[]) {
  const {
    userReactions,
    reactionCounts,
    loading,
    toggleReaction,
    addCampaign,
    // removeCampaign, // временно не используется
    refetch,
  } = useReactionsContext();

  // Регистрируем кампании для отслеживания
  useEffect(() => {
    campaignIds.forEach((campaignId) => {
      addCampaign(campaignId);
    });

    // НЕ удаляем кампании при размонтировании - они могут быть нужны другим компонентам
    // Cleanup происходит автоматически при необходимости
  }, [campaignIds.join(','), addCampaign]); // Добавляем campaignIds в зависимости

  return {
    userReactions,
    reactionCounts,
    loading,
    toggleReaction,
    refetch,
  };
}
