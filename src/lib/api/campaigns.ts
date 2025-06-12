import { createClient } from '@supabase/supabase-js';
import { Campaign } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateCampaign(campaignId: string, updatedCampaign: Campaign): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      campaign_name: updatedCampaign.campaign_name,
      campaign_type: updatedCampaign.campaign_type,
      key_message: updatedCampaign.key_message,
      campaign_vertical: updatedCampaign.campaign_vertical,
      flight_period: updatedCampaign.flight_period,
      geo: updatedCampaign.geo,
      audience: updatedCampaign.audience,
      objectives: updatedCampaign.objectives,
      channels: updatedCampaign.channels,
      materials: updatedCampaign.materials,
      links: updatedCampaign.links,
      attachments: updatedCampaign.attachments,
    })
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Campaign not found');
  }

  return data;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCampaignById(id: string): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Campaign not found');
  }

  return data;
} 