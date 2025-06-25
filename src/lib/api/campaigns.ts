import { createClient } from '@supabase/supabase-js';
import { Campaign } from '@/types/campaign';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateCampaign(
  campaignId: string,
  updatedCampaign: Campaign
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns_v2')
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
      links: updatedCampaign.links,
      status: updatedCampaign.status,
      image_url: updatedCampaign.image_url,
      video_url: updatedCampaign.video_url,
      type: updatedCampaign.type,
      slogan: updatedCampaign.slogan,
      description: updatedCampaign.description,
      targets: updatedCampaign.targets,
      updated_at: new Date().toISOString(),
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
  const { data, error } = await supabase.from('campaigns_v2').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCampaignById(id: string): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns_v2')
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
