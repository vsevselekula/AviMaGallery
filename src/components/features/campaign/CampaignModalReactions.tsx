import React from 'react';
import { CampaignReactions } from '@/components/ui/CampaignReactions';
import { useReactionsSimple as useReactions } from '@/hooks/useReactionsSimple';

interface CampaignModalReactionsProps {
  campaignId: string;
}

export function CampaignModalReactions({
  campaignId,
}: CampaignModalReactionsProps) {
  const { userReactions, reactionCounts, toggleReaction } = useReactions([
    campaignId,
  ]);

  return (
    <div className="mt-12 mb-6">
      <div className="flex justify-center">
        <CampaignReactions
          campaignId={campaignId}
          userReaction={userReactions[campaignId] || null}
          reactionCounts={reactionCounts[campaignId] || {}}
          onToggleReaction={toggleReaction}
        />
      </div>
    </div>
  );
}
