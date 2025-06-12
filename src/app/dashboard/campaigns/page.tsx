'use client';

import { CampaignList } from '@/components/features/CampaignList';
import { Campaign } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();
        if (roleData) {
          setIsAdmin(roleData.role === 'admin' || roleData.role === 'super_admin');
        }
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      console.log('Fetching campaigns from Supabase...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        console.log('Successfully fetched campaigns:', data);
        setCampaigns(data as Campaign[]);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center text-white text-xl">
        <LoadingSpinner />
        <p className="mt-4">Загрузка кампаний...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Рекламные кампании</h1>
        <p className="text-gray-400">Управление и мониторинг рекламных кампаний</p>
      </div>

      <CampaignList campaigns={campaigns} onCampaignUpdated={handleCampaignUpdated} isAdmin={isAdmin} />
    </main>
  );
} 