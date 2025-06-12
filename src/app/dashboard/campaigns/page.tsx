import { getCampaigns } from '@/lib/api/campaigns';
import { CampaignsClient } from './CampaignsClient';

export async function generateStaticParams() {
  try {
    const campaigns = await getCampaigns();
    return campaigns.map((campaign) => ({
      id: campaign.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return <CampaignsClient initialCampaigns={campaigns} />;
} 