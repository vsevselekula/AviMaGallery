'use client';

import { HeroBanner } from '@/components/features/HeroBanner';
import { CampaignList } from '@/components/features/CampaignList';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Campaign } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
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
      console.log('Fetching campaigns for DashboardPage from Supabase...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns for DashboardPage:', error);
      } else {
        console.log('Successfully fetched campaigns for DashboardPage:', data);
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
      <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center text-white text-xl">
        <LoadingSpinner />
        <p className="mt-4">Загрузка кампаний для дашборда...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HeroBanner campaigns={campaigns} onCampaignUpdated={handleCampaignUpdated} />
      <div className="px-8">
        <CampaignList 
          campaigns={campaigns}
          title="Все кампании"
          description="Полный список всех кампаний"
          onCampaignUpdated={handleCampaignUpdated}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
} 