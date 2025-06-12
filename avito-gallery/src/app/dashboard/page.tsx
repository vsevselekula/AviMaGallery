export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CampaignList } from '@/components/features/CampaignList';
import { Campaign } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Дашборд</h1>
      <CampaignList campaigns={campaigns as Campaign[]} />
    </div>
  );
} 