export const dynamic = 'force-dynamic';

import { HeroBanner } from '@/components/features/HeroBanner';
import { CampaignList } from '@/components/features/CampaignList';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Campaign } from '@/lib/types';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  const handleCampaignUpdated = async (updatedCampaign: Campaign) => {
    'use server';
    await supabase
      .from('campaigns')
      .update(updatedCampaign)
      .eq('id', updatedCampaign.id);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <HeroBanner 
        campaigns={campaigns as Campaign[]} 
        onCampaignUpdated={handleCampaignUpdated}
      />
      <CampaignList 
        campaigns={campaigns as Campaign[]} 
        onCampaignUpdated={handleCampaignUpdated}
      />
    </main>
  );
}
