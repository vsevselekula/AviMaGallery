'use client';

import { useState } from 'react';
import { ReactionType, REACTION_CONFIGS } from '@/types/reactions';

interface CampaignReactionsProps {
  campaignId: string;
  userReaction: ReactionType | null;
  reactionCounts: { [K in ReactionType]?: number };
  onToggleReaction: (
    campaignId: string,
    reactionType: ReactionType
  ) => Promise<boolean>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function CampaignReactions({
  campaignId,
  userReaction,
  reactionCounts,
  onToggleReaction,
  disabled = false,
  size = 'md',
  showLabels = false,
}: CampaignReactionsProps) {
  const [isAnimating, setIsAnimating] = useState<ReactionType | null>(null);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (disabled) return;

    setIsAnimating(reactionType);

    try {
      await onToggleReaction(campaignId, reactionType);
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      // Убираем анимацию через небольшую задержку
      setTimeout(() => setIsAnimating(null), 300);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-xs',
          emoji: 'text-sm',
          count: 'text-xs',
        };
      case 'lg':
        return {
          button: 'px-4 py-2 text-base',
          emoji: 'text-xl',
          count: 'text-sm',
        };
      default:
        return {
          button: 'px-3 py-1.5 text-sm',
          emoji: 'text-base',
          count: 'text-xs',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Получаем общее количество реакций
  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Кнопки реакций */}
      <div className="flex items-center gap-1">
        {Object.values(REACTION_CONFIGS).map((config) => {
          const count = reactionCounts[config.type] || 0;
          const isActive = userReaction === config.type;
          const isCurrentlyAnimating = isAnimating === config.type;

          return (
            <button
              key={config.type}
              onClick={() => handleReactionClick(config.type)}
              disabled={disabled}
              className={`
                ${sizeClasses.button}
                flex items-center gap-1 rounded-full transition-all duration-200 backdrop-blur-sm
                ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-200 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                ${isCurrentlyAnimating ? 'animate-pulse scale-110' : ''}
              `}
              title={showLabels ? undefined : config.label}
            >
              <span
                className={`
                  ${sizeClasses.emoji} 
                  transition-transform duration-200
                  ${isCurrentlyAnimating ? 'animate-bounce' : ''}
                `}
              >
                {config.emoji}
              </span>

              {count > 0 && (
                <span className={`${sizeClasses.count} font-medium`}>
                  {count}
                </span>
              )}

              {showLabels && (
                <span className={sizeClasses.count}>{config.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Общий счетчик реакций */}
      {totalReactions > 0 && !showLabels && (
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {totalReactions}{' '}
          {totalReactions === 1
            ? 'реакция'
            : totalReactions < 5
              ? 'реакции'
              : 'реакций'}
        </div>
      )}
    </div>
  );
}

// Компонент для отображения только счетчиков (без возможности взаимодействия)
export function CampaignReactionsDisplay({
  reactionCounts,
  size = 'sm',
}: {
  reactionCounts: { [K in ReactionType]?: number };
  size?: 'sm' | 'md' | 'lg';
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-1',
          emoji: 'text-xs',
          count: 'text-xs',
        };
      case 'lg':
        return {
          container: 'gap-2',
          emoji: 'text-lg',
          count: 'text-sm',
        };
      default:
        return {
          container: 'gap-1.5',
          emoji: 'text-sm',
          count: 'text-xs',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Фильтруем только реакции с количеством > 0
  const activeReactions = Object.entries(reactionCounts)
    .filter(([, count]) => (count || 0) > 0)
    .sort(([, a], [, b]) => (b || 0) - (a || 0)); // Сортируем по убыванию

  if (activeReactions.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${sizeClasses.container}`}>
      {activeReactions.map(([reactionType, count]) => {
        const config = REACTION_CONFIGS[reactionType as ReactionType];
        if (!config) return null;

        return (
          <div
            key={reactionType}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
          >
            <span className={sizeClasses.emoji}>{config.emoji}</span>
            <span
              className={`${sizeClasses.count} font-medium text-gray-600 dark:text-gray-300`}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
