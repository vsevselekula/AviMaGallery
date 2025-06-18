'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ReactionType,
  CampaignReaction,
  UserReactionState,
  CampaignReactionCounts,
} from '@/types/reactions';

interface ReactionsContextType {
  userReactions: UserReactionState;
  reactionCounts: CampaignReactionCounts;
  loading: boolean;
  toggleReaction: (campaignId: string, reactionType: ReactionType) => Promise<boolean>;
  addCampaign: (campaignId: string) => void;
  removeCampaign: (campaignId: string) => void;
  refetch: () => Promise<void>;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(undefined);

interface ReactionsProviderProps {
  children: React.ReactNode;
}

export function ReactionsProvider({ children }: ReactionsProviderProps) {
  const [userReactions, setUserReactions] = useState<UserReactionState>({});
  const [reactionCounts, setReactionCounts] = useState<CampaignReactionCounts>({});
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [trackedCampaigns, setTrackedCampaigns] = useState<Set<string>>(new Set());

  const supabase = createClientComponentClient();

  // Получаем текущего пользователя
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, [supabase]);

  // Загружаем реакции для отслеживаемых кампаний
  const fetchReactions = useCallback(async () => {
    const campaignIds = Array.from(trackedCampaigns);
    
    if (campaignIds.length === 0 || !currentUserId) {
      return;
    }

    try {
      setLoading(true);

      // Используем агрегированные данные из VIEW для лучшей производительности
      const { data: summary, error: summaryError } = await supabase
        .from('campaign_reactions_summary')
        .select('*')
        .in('campaign_id', campaignIds);

      if (summaryError) {
        console.error('Error fetching reaction summary:', summaryError);
        // Фолбэк на основную таблицу
        await fetchReactionsFromMainTable(campaignIds);
        return;
      }

      // Получаем реакции текущего пользователя
      const { data: userReactionsData, error: userError } = await supabase
        .from('campaign_reactions')
        .select('campaign_id, reaction_type')
        .in('campaign_id', campaignIds)
        .eq('user_id', currentUserId);

      if (userError) {
        console.error('Error fetching user reactions:', userError);
        return;
      }

      // Обрабатываем данные
      const newCounts: CampaignReactionCounts = {};
      const newUserReactions: UserReactionState = {};

      // Инициализируем пустые объекты для всех кампаний
      campaignIds.forEach(campaignId => {
        newCounts[campaignId] = {};
        newUserReactions[campaignId] = null;
      });

                    // Заполняем счетчики из summary
        summary?.forEach((item: { campaign_id: string; reaction_type: ReactionType; count: number }) => {
         if (!newCounts[item.campaign_id]) {
           newCounts[item.campaign_id] = {};
         }
          newCounts[item.campaign_id][item.reaction_type] = item.count;
        });

      // Заполняем пользовательские реакции
      userReactionsData?.forEach(item => {
        newUserReactions[item.campaign_id] = item.reaction_type;
      });

      setReactionCounts(newCounts);
      setUserReactions(newUserReactions);

    } catch (error) {
      console.error('Error in fetchReactions:', error);
    } finally {
      setLoading(false);
    }
  }, [trackedCampaigns, currentUserId, supabase]);

  // Фолбэк функция для загрузки из основной таблицы
  const fetchReactionsFromMainTable = useCallback(async (campaignIds: string[]) => {
    try {
      const { data: reactions, error } = await supabase
        .from('campaign_reactions')
        .select('*')
        .in('campaign_id', campaignIds);

      if (error) {
        console.error('Error fetching reactions from main table:', error);
        return;
      }

      // Группируем реакции по кампаниям
      const newCounts: CampaignReactionCounts = {};
      const newUserReactions: UserReactionState = {};

      campaignIds.forEach(campaignId => {
        newCounts[campaignId] = {};
        newUserReactions[campaignId] = null;
      });

      reactions?.forEach((reaction: CampaignReaction) => {
        const { campaign_id, reaction_type, user_id } = reaction;

        // Считаем общее количество реакций
        if (!newCounts[campaign_id][reaction_type]) {
          newCounts[campaign_id][reaction_type] = 0;
        }
        newCounts[campaign_id][reaction_type]!++;

        // Запоминаем реакцию текущего пользователя
        if (user_id === currentUserId) {
          newUserReactions[campaign_id] = reaction_type;
        }
      });

      setReactionCounts(newCounts);
      setUserReactions(newUserReactions);

    } catch (error) {
      console.error('Error in fetchReactionsFromMainTable:', error);
    }
  }, [currentUserId, supabase]);

  // Загружаем реакции при изменении отслеживаемых кампаний
  useEffect(() => {
    if (currentUserId && trackedCampaigns.size > 0) {
      fetchReactions();
    }
  }, [fetchReactions, currentUserId, trackedCampaigns.size]);

  // Настраиваем Realtime подписку (ВРЕМЕННО ОТКЛЮЧЕНО)
  useEffect(() => {
    if (trackedCampaigns.size === 0) return;

    // Realtime подписка временно отключена
    
    // TODO: Включить после исправления базовой логики
    // const channel = supabase
    //   .channel('campaign_reactions_changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'campaign_reactions',
    //       filter: `campaign_id=in.(${Array.from(trackedCampaigns).join(',')})`,
    //     },
    //     (payload) => {
    //       console.log('🔔 Получено обновление реакций:', payload);
    //       fetchReactions();
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   console.log('🔕 Отписываемся от Realtime подписки');
    //   supabase.removeChannel(channel);
    // };
  }, [trackedCampaigns, supabase]);

  // Оптимистическое переключение реакции
  const toggleReaction = useCallback(
    async (campaignId: string, reactionType: ReactionType) => {
      if (!currentUserId) {
        console.error('❌ User not authenticated');
        return false;
      }

      const currentReaction = userReactions[campaignId];
      const isRemoving = currentReaction === reactionType;

      // 1. ОПТИМИСТИЧЕСКОЕ ОБНОВЛЕНИЕ UI
      setUserReactions(prev => ({
        ...prev,
        [campaignId]: isRemoving ? null : reactionType,
      }));

      setReactionCounts(prev => {
        const newCounts = { ...prev };

        if (!newCounts[campaignId]) {
          newCounts[campaignId] = {};
        }

        // Логика изменения счетчиков:
        if (isRemoving) {
          // Удаляем текущую реакцию пользователя
          if (newCounts[campaignId][currentReaction!]) {
            newCounts[campaignId][currentReaction!]! -= 1;
            if (newCounts[campaignId][currentReaction!] === 0) {
              delete newCounts[campaignId][currentReaction!];
            }
          }
        } else {
          // Если была предыдущая реакция - убираем её
          if (currentReaction && newCounts[campaignId][currentReaction]) {
            newCounts[campaignId][currentReaction]! -= 1;
            if (newCounts[campaignId][currentReaction] === 0) {
              delete newCounts[campaignId][currentReaction];
            }
          }
          
          // Добавляем новую реакцию
          if (!newCounts[campaignId][reactionType]) {
            newCounts[campaignId][reactionType] = 0;
          }
          newCounts[campaignId][reactionType]! += 1;
        }

        // Оптимистическое обновление завершено

        return newCounts;
      });

      // 2. СИНХРОНИЗАЦИЯ С СЕРВЕРОМ
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
            .upsert(
              {
                campaign_id: campaignId,
                user_id: currentUserId,
                reaction_type: reactionType,
              },
              {
                onConflict: 'campaign_id,user_id',
              }
            );

          if (error) throw error;
        }

        // Перезагружаем актуальные данные с сервера
        setTimeout(() => {
          fetchReactions();
        }, 500);
        
        return true;

      } catch (error) {
        console.error('❌ Ошибка синхронизации с сервером:', error);

        // 3. ОТКАТ ИЗМЕНЕНИЙ ПРИ ОШИБКЕ
        setUserReactions(prev => ({
          ...prev,
          [campaignId]: currentReaction,
        }));

        // Восстанавливаем счетчики
        setReactionCounts(prev => {
          const newCounts = { ...prev };

          if (!newCounts[campaignId]) {
            newCounts[campaignId] = {};
          }

          // Откатываем изменения счетчиков
          if (!isRemoving) {
            // Убираем добавленную реакцию
            if (newCounts[campaignId][reactionType]) {
              newCounts[campaignId][reactionType]! -= 1;
              if (newCounts[campaignId][reactionType] === 0) {
                delete newCounts[campaignId][reactionType];
              }
            }
          }

          // Возвращаем предыдущую реакцию
          if (currentReaction) {
            if (!newCounts[campaignId][currentReaction]) {
              newCounts[campaignId][currentReaction] = 0;
            }
            newCounts[campaignId][currentReaction]! += 1;
          }

          return newCounts;
        });

        return false;
      }
    },
    [currentUserId, userReactions, supabase]
  );

  // Функции для управления отслеживаемыми кампаниями
  const addCampaign = useCallback((campaignId: string) => {
    setTrackedCampaigns(prev => new Set(Array.from(prev).concat(campaignId)));
  }, []);

  const removeCampaign = useCallback((campaignId: string) => {
    setTrackedCampaigns(prev => {
      const newSet = new Set(prev);
      newSet.delete(campaignId);
      return newSet;
    });
  }, []);

  const contextValue = useMemo(() => ({
    userReactions,
    reactionCounts,
    loading,
    toggleReaction,
    addCampaign,
    removeCampaign,
    refetch: fetchReactions,
  }), [userReactions, reactionCounts, loading, toggleReaction, addCampaign, removeCampaign, fetchReactions]);

  return (
    <ReactionsContext.Provider value={contextValue}>
      {children}
    </ReactionsContext.Provider>
  );
}

export function useReactionsContext() {
  const context = useContext(ReactionsContext);
  if (context === undefined) {
    throw new Error('useReactionsContext must be used within a ReactionsProvider');
  }
  return context;
} 