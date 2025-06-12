import { createClient } from '@supabase/supabase-js';
import { VerticalClient } from './VerticalClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateStaticParams() {
  try {
    const { data: verticals } = await supabase
      .from('verticals')
      .select('name');

    return verticals?.map((vertical) => ({
      verticalName: vertical.name,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function VerticalPage({ params }: { params: { verticalName: string } }) {
  const { data: vertical } = await supabase
    .from('verticals')
    .select('*')
    .eq('name', params.verticalName)
    .single();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('campaign_vertical', params.verticalName)
    .order('flight_period->>start_date', { ascending: false });

  return (
    <VerticalClient
      verticalName={params.verticalName}
      initialVertical={vertical}
      initialCampaigns={campaigns || []}
    />
  );
} 