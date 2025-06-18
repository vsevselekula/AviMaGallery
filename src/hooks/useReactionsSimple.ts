import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ReactionType, UserReactionState, CampaignReactionCounts } from '@/types/reactions';

/**
 * ПРОСТАЯ версия хука реакций для отладки проблем
 * Без глобального состояния, без оптимистических обновлений
 */
export function useReactionsSimple(campaignIds: string[]) {
  const [userReactions, setUserReactions] = useState<UserReactionState>({});
  const [reactionCounts, setReactionCounts] = useState<CampaignReactionCounts>({});
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // Получаем текущего пользователя
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, [supabase]);

  // Загружаем реакции
  const fetchReactions = useCallback(async () => {
    if (campaignIds.length === 0 || !currentUserId) {
      return;
    }

    setLoading(true);

    try {
      // Загружаем все реакции для указанных кампаний
      const { data: reactions, error } = await supabase
        .from('campaign_reactions')
        .select('*')
        .in('campaign_id', campaignIds);

      if (error) {
        console.error('❌ Ошибка загрузки реакций:', error);
        return;
      }

      // Обрабатываем данные
      const newCounts: CampaignReactionCounts = {};
      const newUserReactions: UserReactionState = {};

      // Инициализируем пустые объекты
      campaignIds.forEach(campaignId => {
        newCounts[campaignId] = {};
        newUserReactions[campaignId] = null;
      });

      // Обрабатываем каждую реакцию
      reactions?.forEach(reaction => {
        const { campaign_id, reaction_type, user_id } = reaction;

        // Считаем общее количество
        if (!newCounts[campaign_id][reaction_type as ReactionType]) {
          newCounts[campaign_id][reaction_type as ReactionType] = 0;
        }
        newCounts[campaign_id][reaction_type as ReactionType]!++;

        // Сохраняем реакцию текущего пользователя
        if (user_id === currentUserId) {
          newUserReactions[campaign_id] = reaction_type as ReactionType;
        }
      });

      setReactionCounts(newCounts);
      setUserReactions(newUserReactions);

    } catch (error) {
      console.error('💥 Критическая ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  }, [campaignIds, currentUserId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Переключение реакции (ПРОСТАЯ версия)
  const toggleReaction = useCallback(async (campaignId: string, reactionType: ReactionType) => {
    if (!currentUserId) {
      console.error('❌ Пользователь не авторизован');
      return false;
    }

    const currentReaction = userReactions[campaignId];
    const isRemoving = currentReaction === reactionType;

    try {
      if (isRemoving) {
        // Удаляем реакцию
        const { error } = await supabase
          .from('campaign_reactions')
          .delete()
          .eq('campaign_id', campaignId)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        // Добавляем/обновляем реакцию
        const { error } = await supabase
          .from('campaign_reactions')
          .upsert({
            campaign_id: campaignId,
            user_id: currentUserId,
            reaction_type: reactionType,
          }, {
            onConflict: 'campaign_id,user_id'
          });

        if (error) throw error;
      }
      
      // Перезагружаем данные
      await fetchReactions();

      // Уведомляем другие компоненты об обновлении
      window.dispatchEvent(new CustomEvent('reactions-updated', {
        detail: { campaignId }
      }));

      return true;

    } catch (error) {
      console.error('❌ Ошибка операции:', error);
      return false;
    }
  }, [currentUserId, userReactions, supabase, fetchReactions]);

  // Загружаем данные при изменении кампаний или пользователя
  useEffect(() => {
    if (currentUserId && campaignIds.length > 0) {
      fetchReactions();
    }
  }, [fetchReactions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Слушаем уведомления об обновлении реакций от других компонентов
  useEffect(() => {
    const handleReactionsUpdate = (event: CustomEvent) => {
      const { campaignId } = event.detail;
      // Если обновленная кампания есть в нашем списке - перезагружаем данные
      if (campaignIds.includes(campaignId) && currentUserId) {
        fetchReactions();
      }
    };

    window.addEventListener('reactions-updated', handleReactionsUpdate as EventListener);

    return () => {
      window.removeEventListener('reactions-updated', handleReactionsUpdate as EventListener);
    };
  }, [campaignIds, currentUserId, fetchReactions]);

  return {
    userReactions,
    reactionCounts,
    loading,
    toggleReaction,
    refetch: fetchReactions,
  };
} 