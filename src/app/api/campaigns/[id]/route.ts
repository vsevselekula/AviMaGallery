import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Campaign } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const campaignId = params.id;
  console.log('Attempting to update campaign with ID:', campaignId);
  
  // Создаем клиент Supabase напрямую
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const updatedCampaign: Campaign = await request.json();
    console.log('Received campaign data:', updatedCampaign);

    // Проверяем, существует ли кампания
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    console.log('Existing campaign check:', { existingCampaign, fetchError });

    if (fetchError) {
      console.error('Error fetching campaign:', fetchError);
      return new NextResponse(JSON.stringify({ error: `Error fetching campaign: ${fetchError.message}` }), { status: 500 });
    }

    if (!existingCampaign) {
      console.log('Campaign not found in database');
      return new NextResponse(JSON.stringify({ error: 'Campaign not found' }), { status: 404 });
    }

    // Подготовка данных для обновления в Supabase
    const campaignDataForSupabase = {
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
    };

    console.log('Updating campaign with data:', campaignDataForSupabase);

    const { data, error } = await supabase
      .from('campaigns')
      .update(campaignDataForSupabase)
      .eq('id', campaignId)
      .select();

    if (error) {
      console.error('Error updating campaign:', error);
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log('No data returned after update');
      return new NextResponse(JSON.stringify({ error: 'Campaign not found' }), { status: 404 });
    }

    console.log('Successfully updated campaign:', data[0]);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Failed to parse request body or other error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
} 