export type ReactionType = 'like' | 'love' | 'fire' | 'clap' | 'thinking' | 'wow';

export interface CampaignReaction {
  id: string;
  campaign_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  updated_at: string;
}

export interface ReactionSummary {
  campaign_id: string;
  reaction_type: ReactionType;
  count: number;
  user_ids: string[];
}

export interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}

export const REACTION_CONFIGS: Record<ReactionType, ReactionConfig> = {
  like: {
    type: 'like',
    emoji: '👍',
    label: 'Нравится',
    color: 'text-blue-500'
  },
  love: {
    type: 'love',
    emoji: '❤️',
    label: 'Обожаю',
    color: 'text-red-500'
  },
  fire: {
    type: 'fire',
    emoji: '🔥',
    label: 'Огонь',
    color: 'text-orange-500'
  },
  clap: {
    type: 'clap',
    emoji: '👏',
    label: 'Браво',
    color: 'text-yellow-500'
  },
  thinking: {
    type: 'thinking',
    emoji: '🤔',
    label: 'Интересно',
    color: 'text-purple-500'
  },
  wow: {
    type: 'wow',
    emoji: '😮',
    label: 'Вау',
    color: 'text-green-500'
  }
};

export interface UserReactionState {
  [campaignId: string]: ReactionType | null;
}

export interface CampaignReactionCounts {
  [campaignId: string]: {
    [K in ReactionType]?: number;
  };
} 