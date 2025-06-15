import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ReactionType, 
  CampaignReaction, 
  UserReactionState, 
  CampaignReactionCounts 
} from '@/types/reactions';

export function useReactions(campaignIds: string[]) {
  const [userReactions, setUserReactions] = useState<UserReactionState>({});
  const [reactionCounts, setReactionCounts] = useState<CampaignReactionCounts>({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  // Принудительно сбрасываем loading через 3 секунды, если что-то пошло не так
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Получаем текущего пользователя
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, [supabase]);

  // Загружаем реакции для указанных кампаний
  const fetchReactions = useCallback(async () => {
    if (campaignIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Получаем все реакции для указанных кампаний
      const { data: reactions, error } = await supabase
        .from('campaign_reactions')
        .select('*')
        .in('campaign_id', campaignIds);

      if (error) {
        console.error('Error fetching reactions:', error);
        // Если таблица не существует, просто устанавливаем пустые данные
        setReactionCounts({});
        setUserReactions({});
        setLoading(false);
        return;
      }

      // Группируем реакции по кампаниям
      const counts: CampaignReactionCounts = {};
      const userReactionState: UserReactionState = {};

      campaignIds.forEach(campaignId => {
        counts[campaignId] = {};
        userReactionState[campaignId] = null;
      });

      reactions?.forEach((reaction: CampaignReaction) => {
        const { campaign_id, reaction_type, user_id } = reaction;
        
        // Считаем общее количество реакций
        if (!counts[campaign_id][reaction_type]) {
          counts[campaign_id][reaction_type] = 0;
        }
        counts[campaign_id][reaction_type]!++;

        // Запоминаем реакцию текущего пользователя
        if (user_id === currentUserId) {
          userReactionState[campaign_id] = reaction_type;
        }
      });

      setReactionCounts(counts);
      setUserReactions(userReactionState);
    } catch (error) {
      console.error('Error in fetchReactions:', error);
    } finally {
      setLoading(false);
    }
  }, [campaignIds, currentUserId, supabase]);

  // Загружаем реакции при изменении кампаний или пользователя
  useEffect(() => {
    if (currentUserId !== null) {
      fetchReactions();
    } else {
      setLoading(false);
    }
  }, [fetchReactions, currentUserId]);

  // Подписываемся на изменения в таблице реакций для обновления в реальном времени
  useEffect(() => {
    if (campaignIds.length === 0) return;

    const channel = supabase
      .channel('campaign_reactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_reactions',
          filter: `campaign_id=in.(${campaignIds.join(',')})`
        },
        () => {
          // Обновляем реакции при любых изменениях
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignIds, fetchReactions, supabase]);

  // Добавить или изменить реакцию
  const addReaction = useCallback(async (campaignId: string, reactionType: ReactionType) => {
    if (!currentUserId) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('campaign_reactions')
        .upsert({
          campaign_id: campaignId,
          user_id: currentUserId,
          reaction_type: reactionType
        }, {
          onConflict: 'campaign_id,user_id'
        });

      if (error) {
        console.error('Error adding reaction:', error);
        // Если таблица не существует, показываем пользователю сообщение
        if (error.code === '42P01') {
          console.warn('Reactions table does not exist. Please run the migration.');
        }
        return false;
      }

      // Обновляем локальное состояние
      const previousReaction = userReactions[campaignId];
      
      setUserReactions(prev => ({
        ...prev,
        [campaignId]: reactionType
      }));

      setReactionCounts(prev => {
        const newCounts = { ...prev };
        
        // Уменьшаем счетчик предыдущей реакции
        if (previousReaction && newCounts[campaignId]?.[previousReaction]) {
          newCounts[campaignId][previousReaction]! -= 1;
          if (newCounts[campaignId][previousReaction] === 0) {
            delete newCounts[campaignId][previousReaction];
          }
        }

        // Увеличиваем счетчик новой реакции
        if (!newCounts[campaignId]) {
          newCounts[campaignId] = {};
        }
        if (!newCounts[campaignId][reactionType]) {
          newCounts[campaignId][reactionType] = 0;
        }
        newCounts[campaignId][reactionType]! += 1;

        return newCounts;
      });

      return true;
    } catch (error) {
      console.error('Error in addReaction:', error);
      return false;
    }
  }, [currentUserId, userReactions, supabase]);

  // Удалить реакцию
  const removeReaction = useCallback(async (campaignId: string) => {
    if (!currentUserId) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('campaign_reactions')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }

      // Обновляем локальное состояние
      const previousReaction = userReactions[campaignId];
      
      setUserReactions(prev => ({
        ...prev,
        [campaignId]: null
      }));

      if (previousReaction) {
        setReactionCounts(prev => {
          const newCounts = { ...prev };
          
          if (newCounts[campaignId]?.[previousReaction]) {
            newCounts[campaignId][previousReaction]! -= 1;
            if (newCounts[campaignId][previousReaction] === 0) {
              delete newCounts[campaignId][previousReaction];
            }
          }

          return newCounts;
        });
      }

      return true;
    } catch (error) {
      console.error('Error in removeReaction:', error);
      return false;
    }
  }, [currentUserId, userReactions, supabase]);

  // Переключить реакцию (добавить если нет, удалить если есть такая же)
  const toggleReaction = useCallback(async (campaignId: string, reactionType: ReactionType) => {
    const currentReaction = userReactions[campaignId];
    
    if (currentReaction === reactionType) {
      // Если пользователь кликнул на ту же реакцию - удаляем её
      return await removeReaction(campaignId);
    } else {
      // Иначе добавляем/меняем реакцию
      return await addReaction(campaignId, reactionType);
    }
  }, [userReactions, addReaction, removeReaction]);

  return {
    userReactions,
    reactionCounts,
    loading,
    addReaction,
    removeReaction,
    toggleReaction,
    refetch: fetchReactions
  };
} 