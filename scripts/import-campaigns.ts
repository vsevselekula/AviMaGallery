import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Загружаем переменные окружения из .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\nMissing environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!supabaseServiceKey)
    console.error('- SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

// Создаем клиент с service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface NewCampaign {
  campaign_type: string;
  campaign_vertical: string;
  campaign_name: string;
  flight_period: {
    start_date: string;
    end_date: string;
  };
  geo: string;
  audience: string;
  objectives: string[];
  key_message: string;
  channels: string[];
  materials: string[];
  links: Array<{ label: string; url: string }>;
  attachments: Array<{ label: string; url: string }>;
}

async function importCampaigns() {
  const campaignsFilePath = resolve(process.cwd(), 'src/data/campaigns.json');

  let newCampaigns: NewCampaign[];

  try {
    newCampaigns = JSON.parse(fs.readFileSync(campaignsFilePath, 'utf-8'));
  } catch (error) {
    console.error('Error reading JSON files:', error);
    process.exit(1);
  }

  const { data: existingCampaigns, error: fetchError } = await supabase
    .from('campaigns')
    .select('campaign_name');

  if (fetchError) {
    console.error('Error fetching existing campaigns:', fetchError);
    process.exit(1);
  }

  const existingCampaignTitles = new Set(
    existingCampaigns?.map((c) => c.campaign_name)
  );

  const campaignsToInsert = [];
  const duplicateCampaigns = [];

  for (const campaign of newCampaigns) {
    if (existingCampaignTitles.has(campaign.campaign_name)) {
      duplicateCampaigns.push(campaign.campaign_name);
    } else {
      campaignsToInsert.push({
        campaign_name: campaign.campaign_name,
        campaign_type: campaign.campaign_type,
        campaign_vertical: campaign.campaign_vertical,
        flight_period: campaign.flight_period,
        geo: campaign.geo,
        audience: campaign.audience,
        objectives: campaign.objectives,
        key_message: campaign.key_message,
        channels: campaign.channels,
        materials: campaign.materials,
        links: campaign.links,
        attachments: campaign.attachments,
      });
    }
  }

  if (campaignsToInsert.length > 0) {
    console.log(`Inserting ${campaignsToInsert.length} new campaigns...`);
    const { error: insertError } = await supabase
      .from('campaigns')
      .insert(campaignsToInsert);

    if (insertError) {
      console.error('Error inserting new campaigns:', insertError);
    } else {
      console.log('Successfully inserted new campaigns.');
    }
  } else {
    console.log('No new campaigns to insert.');
  }

  if (duplicateCampaigns.length > 0) {
    console.warn('\nDuplicate campaigns (not inserted):');
    duplicateCampaigns.forEach((title) => console.warn(`- ${title}`));
  }

  process.exit(0);
}

importCampaigns();
