'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Campaign } from '@/types/campaign';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CampaignList } from '@/components/features/CampaignList';
import { HeroBanner } from '@/components/features/HeroBanner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CampaignFormModal } from '@/components/features/campaign/CampaignFormModal';
import { useCampaigns } from '@/hooks/useCampaignsQuery';

function DashboardContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Используем TanStack Query для получения кампаний
  const { data: campaigns = [], isLoading, error } = useCampaigns();

  const campaignId = searchParams.get('campaign');

  // Получение роли пользователя (пока оставляем как есть, позже тоже переведем на Query)
  useEffect(() => {
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

  const handleCampaignModalClose = () => {
    setSelectedCampaign(null);
    // Убираем параметр campaign из URL
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('campaign');
    router.replace(currentUrl.pathname + currentUrl.search);
  };

  const canCreateCampaigns =
    userRole === 'super_admin' || userRole === 'editor';

  // Показываем ошибку, если есть
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            Ошибка загрузки кампаний
          </div>
          <div className="text-gray-400">{error.message}</div>
        </div>
      </div>
    );
  }

  // Показываем загрузку
  if (isLoading) {
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
          // Не нужно передавать onCampaignCreated - TanStack Query автоматически обновит кэш
        />
      )}

      {selectedCampaign && (
        <CampaignFormModal
          campaign={selectedCampaign}
          onClose={handleCampaignModalClose}
          // Не нужно передавать onCampaignUpdated и onCampaignDeleted - TanStack Query автоматически обновит кэш
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
