'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Campaign } from '@/types/campaign';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignList } from '@/components/features/CampaignList';
import { HeroBanner } from '@/components/features/HeroBanner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CampaignFormModal } from '@/components/features/campaign/CampaignFormModal';

function DashboardContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const campaignId = searchParams.get('campaign');

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns_v2')
        .select('*')
        .order('flight_period->>start_date', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns_v2:', error);

        // Если это сетевая ошибка, попробуем еще раз через 2 секунды
        if (error.message?.includes('Failed to fetch') || error.code === '') {
          setTimeout(() => {
            fetchCampaigns();
          }, 2000);
          return;
        }

        setLoading(false);
      } else {
        setCampaigns(data as Campaign[]);
        setLoading(false);
      }
    };

    const fetchUserRole = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      if (supabaseUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();
        if (roleData) {
          setUserRole(roleData.role);
        }
      }
    };

    fetchCampaigns();
    fetchUserRole();
  }, [supabase]);

  // Обработка параметра campaign из URL
  useEffect(() => {
    if (!campaignId) {
      setSelectedCampaign(null);
      return;
    }

    // Ищем кампанию в уже загруженных
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    } else if (campaigns.length > 0) {
      // Если кампания не найдена в загруженных, но кампании уже загружены,
      // значит такой кампании не существует - убираем параметр из URL
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('campaign');
      router.replace(currentUrl.pathname + currentUrl.search);
    }
    // Если campaigns.length === 0, значит кампании еще загружаются, ждем
  }, [campaignId, campaigns, router]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
  };

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns((prevCampaigns) => [newCampaign, ...prevCampaigns]);
  };

  const handleCampaignDeleted = (deletedCampaignId: string) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.filter((campaign) => campaign.id !== deletedCampaignId)
    );
  };

  const handleCampaignModalClose = () => {
    setSelectedCampaign(null);
    // Убираем параметр campaign из URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('campaign');
    router.replace(currentUrl.pathname + currentUrl.search);
  };

  const canCreateCampaigns =
    userRole === 'super_admin' || userRole === 'editor';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <HeroBanner campaigns={campaigns} />
      <div className="px-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Все кампании</h2>
          {canCreateCampaigns && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Создать кампанию
            </button>
          )}
        </div>
        <CampaignList campaigns={campaigns} title="" />
      </div>

      {showCreateModal && (
        <CampaignFormModal
          onClose={() => setShowCreateModal(false)}
          onCampaignCreated={handleCampaignCreated}
        />
      )}

      {selectedCampaign && (
        <CampaignFormModal
          campaign={selectedCampaign}
          onClose={handleCampaignModalClose}
          onCampaignUpdated={handleCampaignUpdated}
          onCampaignDeleted={handleCampaignDeleted}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen w-full">
          <LoadingSpinner />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
